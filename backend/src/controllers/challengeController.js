const crypto = require("crypto");

const { pool } = require("../db/pool");
const { createChallengeSchema } = require("../validators/challengeValidators");

function hashFlag(flag) {
  return crypto
    .createHash("sha256")
    .update(flag, "utf8")
    .digest("hex");
}

async function listChallenges(req, res, next) {
  try {
    const { eventId } = req.params;

    const result = await pool.query(
      `
      SELECT
        id,
        event_id,
        event_day_id,
        title,
        slug,
        description,
        category,
        difficulty,
        points,
        state,
        hint,
        author_name,
        release_at,
        archive_at,
        is_final,
        final_order,
        attachment_url,
        created_at,
        updated_at
      FROM challenges
      WHERE event_id = $1
        AND state = 'PUBLISHED'
        AND (release_at IS NULL OR release_at <= NOW())
        AND (archive_at IS NULL OR archive_at > NOW())
      ORDER BY
        is_final ASC,
        points ASC,
        title ASC
      `,
      [eventId]
    );

    return res.json({
      challenges: result.rows,
    });
  } catch (error) {
    next(error);
  }
}

async function getChallengeBySlug(req, res, next) {
  try {
    const { slug } = req.params;

    const result = await pool.query(
      `
      SELECT
        id,
        event_id,
        event_day_id,
        title,
        slug,
        description,
        category,
        difficulty,
        points,
        state,
        hint,
        author_name,
        release_at,
        archive_at,
        is_final,
        final_order,
        attachment_url,
        created_at,
        updated_at
      FROM challenges
      WHERE slug = $1
        AND state = 'PUBLISHED'
        AND (release_at IS NULL OR release_at <= NOW())
        AND (archive_at IS NULL OR archive_at > NOW())
      LIMIT 1
      `,
      [slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Challenge not found",
      });
    }

    return res.json({
      challenge: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
}

async function createChallenge(req, res, next) {
  try {
    const validation = createChallengeSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        error: "Invalid challenge data",
        details: validation.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    const data = validation.data;

    if (data.archive_at && data.release_at) {
      if (new Date(data.archive_at) <= new Date(data.release_at)) {
        return res.status(400).json({
          error: "archive_at must be after release_at",
        });
      }
    }

    if (
      !data.is_final &&
      data.final_order !== null &&
      data.final_order !== undefined
    ) {
      return res.status(400).json({
        error: "final_order must be empty for non-final challenges",
      });
    }

    if (
      data.is_final &&
      (data.final_order === null || data.final_order === undefined)
    ) {
      return res.status(400).json({
        error: "final_order is required for final challenges",
      });
    }

    const eventResult = await pool.query(
      `
      SELECT
        id,
        start_at,
        end_at
      FROM events
      WHERE id = $1
        AND status <> 'ARCHIVED'
      LIMIT 1
      `,
      [data.event_id]
    );

    if (eventResult.rows.length === 0) {
      return res.status(404).json({
        error: "Event not found",
      });
    }

    if (data.event_day_id) {
      const dayResult = await pool.query(
        `
        SELECT
          id,
          event_id,
          start_at,
          end_at
        FROM event_days
        WHERE id = $1
        LIMIT 1
        `,
        [data.event_day_id]
      );

      if (dayResult.rows.length === 0) {
        return res.status(404).json({
          error: "Event day not found",
        });
      }

      const day = dayResult.rows[0];

      if (day.event_id !== data.event_id) {
        return res.status(400).json({
          error: "Event day does not belong to the selected event",
        });
      }

      if (data.release_at) {
        const releaseAt = new Date(data.release_at);

        if (
          releaseAt < new Date(day.start_at) ||
          releaseAt > new Date(day.end_at)
        ) {
          return res.status(400).json({
            error: "release_at must be inside the selected event day",
          });
        }
      }
    }

    const existingChallenge = await pool.query(
      `
      SELECT id
      FROM challenges
      WHERE slug = $1
      LIMIT 1
      `,
      [data.slug]
    );

    if (existingChallenge.rows.length > 0) {
      return res.status(409).json({
        error: "Challenge slug is already registered",
      });
    }

    const flagHash = hashFlag(data.flag);

    const result = await pool.query(
      `
      INSERT INTO challenges (
        event_id,
        event_day_id,
        title,
        slug,
        description,
        category,
        difficulty,
        points,
        state,
        flag_hash,
        hint,
        author_name,
        release_at,
        archive_at,
        is_final,
        final_order,
        attachment_url
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        'DRAFT',
        $9,
        $10,
        $11,
        $12,
        $13,
        $14,
        $15,
        $16
      )
      RETURNING
        id,
        event_id,
        event_day_id,
        title,
        slug,
        description,
        category,
        difficulty,
        points,
        state,
        hint,
        author_name,
        release_at,
        archive_at,
        is_final,
        final_order,
        attachment_url,
        created_at,
        updated_at
      `,
      [
        data.event_id,
        data.event_day_id || null,
        data.title,
        data.slug,
        data.description,
        data.category,
        data.difficulty,
        data.points,
        flagHash,
        data.hint || null,
        data.author_name || null,
        data.release_at || null,
        data.archive_at || null,
        data.is_final,
        data.final_order ?? null,
        data.attachment_url || null,
      ]
    );

    return res.status(201).json({
      message: "Challenge created successfully",
      challenge: result.rows[0],
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        error: "Challenge slug or final order is already in use",
      });
    }

    next(error);
  }
}

async function publishChallenge(req, res, next) {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      UPDATE challenges
      SET
        state = 'PUBLISHED',
        updated_at = NOW()
      WHERE id = $1
        AND state = 'DRAFT'
      RETURNING
        id,
        event_id,
        event_day_id,
        title,
        slug,
        category,
        difficulty,
        points,
        state,
        release_at,
        archive_at,
        is_final,
        final_order,
        updated_at
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Draft challenge not found",
      });
    }

    return res.json({
      message: "Challenge published successfully",
      challenge: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
}

async function archiveChallenge(req, res, next) {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      UPDATE challenges
      SET
        state = 'ARCHIVED',
        archive_at = COALESCE(archive_at, NOW()),
        updated_at = NOW()
      WHERE id = $1
        AND state <> 'ARCHIVED'
      RETURNING
        id,
        event_id,
        event_day_id,
        title,
        slug,
        category,
        difficulty,
        points,
        state,
        release_at,
        archive_at,
        is_final,
        final_order,
        updated_at
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Challenge not found or already archived",
      });
    }

    return res.json({
      message: "Challenge archived successfully",
      challenge: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
}

async function getChallengeStatus(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      `
      SELECT
        s.id,
        s.points_awarded,
        s.solved_at
      FROM solves s
      WHERE s.challenge_id = $1
        AND s.user_id = $2
      LIMIT 1
      `,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.json({
        solved: false,
      });
    }

    return res.json({
      solved: true,
      points_awarded: Number(result.rows[0].points_awarded) || 0,
      solved_at: result.rows[0].solved_at,
    });
  } catch (error) {
    next(error);
  }
}

async function getChallengeArtifact(req, res, next) {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT
        id,
        slug,
        title
      FROM challenges
      WHERE id = $1
        AND state = 'PUBLISHED'
        AND (release_at IS NULL OR release_at <= NOW())
        AND (archive_at IS NULL OR archive_at > NOW())
      LIMIT 1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Challenge not found or unavailable",
      });
    }

    const challenge = result.rows[0];

    if (challenge.slug === "archive-breadcrumbs") {
      return res.json({
        artifact: {
          type: "osint-dossier",
          title: "Archive Breadcrumbs evidence",
          message:
            "Recovered from a fictional internal archive. Correlate the records and identify the project reference that survives across the evidence.",
          text: `
ARCHIVE INDEX // NXTGENSEC TRAINING

Record A
Date: 2026-08-12
Owner: maya.rao
Project: ARC-17
Status: archived

Record B
Date: 2026-08-19
Owner: leon.k
Project: ARC-17
Status: superseded

Record C
Date: 2026-08-27
Owner: maya.rao
Project: BREADCRUMB
Status: approved

Record D
Date: 2026-08-29
Owner: ops.archive
Project: BREADCRUMB
Status: retained

ARCHIVE NOTE
The approved project was retained under the archive label:
archive-breadcrumbs

Verification token:
4d71c9e2

DECoy archive reference:
NXTGENSEC{archive_breadcrumbs_decoy_11}

Analyst instruction:
Use the retained archive label together with the verification token.
Normalize the label to lowercase and replace spaces or separators with underscores.
The decoy reference above is not the submission value.
          `.trim(),
          clue:
            "Correlate the approved and retained records. The retained archive label and verification token form the submission value; ignore the explicit decoy.",
        },
      });
    }

    if (challenge.slug === "register-relay") {
      return res.json({
        artifact: {
          type: "reverse-engineering-trace",
          title: "Register Relay execution trace",
          message:
            "Recovered pseudo-assembly from the training binary. Trace R1 through every operation and determine which value reaches the final comparison.",
          text: `
REGISTER RELAY // RECOVERED EXECUTION TRACE

INPUT
R1 = 0x4E585447
R2 = 0x454E5345

; Step 01
XOR R1, 0x2F41600C

; Step 02
ADD R1, 0x2468ACE0

; Step 03
ROL R1, 5

; Step 04
XOR R1, R2

; Step 05
ROR R1, 5

; Step 06
SUB R1, 0x2468ACE0

; Final comparison
CMP R1, 0x8B42E6D1
JNE reject

Candidate A:
NXTGENSEC{register_relay_decoy_22}

Candidate B:
NXTGENSEC{register_relay_8b42e6d1}

SYSTEM NOTE
The final comparison checks the transformed register value.
One candidate is deliberately misleading.
          `.trim(),
          clue:
            "Trace R1 through the hexadecimal operations. The final comparison value identifies which candidate is authentic.",
        },
      });
    }

    if (challenge.slug === "logbook-anomaly") {
      return res.json({
        artifact: {
          type: "forensics-log",
          title: "Logbook Anomaly evidence",
          message:
            "Recovered incident records from a short investigation window. Compare sequence numbers with timestamps and revision records.",
          text: `
INCIDENT LOG // CASE 27-B

SEQ 1001 | 2026-08-31 09:14:02 | analyst.m | OPENED CASE 27-B
SEQ 1002 | 2026-08-31 09:16:41 | analyst.m | REVIEWED SENSOR-A
SEQ 1003 | 2026-08-31 09:19:08 | ops-3     | ATTACHED RECORD R17
SEQ 1004 | 2026-08-31 09:23:55 | analyst.m | MARKED R17 AS VALID
SEQ 1005 | 2026-08-31 09:28:12 | ops-3     | UPDATED R17
SEQ 1007 | 2026-08-31 09:31:44 | analyst.m | CLOSED CASE 27-B

REVISION REGISTER

R17 original:
created_at = 2026-08-31 09:18:51
owner      = ops-3
status     = pending
revision   = 1

R17 latest:
created_at = 2026-08-31 09:18:51
owner      = ops-3
status     = approved
revision   = 3

MISSING SEQUENCE
SEQ 1006 is absent from the recovered log.

RECOVERED NOTE
"The authentic record is the one whose revision history explains the missing sequence."

FLAG-SHAPED VALUES

NXTGENSEC{logbook_anomaly_decoy_44}
NXTGENSEC{logbook_anomaly_73c91f5a}

ANALYST NOTE
The decoy was added after the original record review.
The authentic value is associated with the corrected revision path.
          `.trim(),
          clue:
            "Use the missing sequence and revision history to identify the corrected record. The later-added flag-shaped value is the decoy.",
        },
      });
    }

    if (challenge.slug === "shift-register") {
      return res.json({
        artifact: {
          type: "crypto-text",
          title: "Shift Register encoded note",
          message:
            "A recovered note uses a repeating alphabet shift. Determine the shift from the evidence, then decode the message.",
          text: `
SHIFT REGISTER // RECOVERED NOTE

ALPHABET TRACE

Plain:  ABCDEFGHIJKLMNOPQRSTUVWXYZ
Cipher: DEFGHIJKLMNOPQRSTUVWXYZABC

This trace was found beside the encrypted note.
Do not assume every flag-shaped value in the decoded material is authentic.

ENCRYPTED NOTE

QAWJHQVHF: VKLIW UHJLVWHU LGHQWLILHG LQ WKH WUDLQLQJ ORJ.
UHFRYHUHG YDOXH: VKLIW UHJLVWHU 6D41D8I3

DECOY RECORD

QAWJHQVHF{VKLIW_UHJLVWHU_GHFRB_31}

ANALYST NOTE

The cipher alphabet is shifted forward.
To recover the original text, reverse the shift.
The decoded value must preserve the NXTGENSEC flag format.
The decoy record was inserted into the recovered note after the original entry.
          `.trim(),
          clue:
            "Use the alphabet trace to determine the shift direction. Decode the note, then distinguish the recovered value from the later-added decoy.",
        },
      });
    }

    if (challenge.slug === "packet-postcard") {
      return res.json({
        artifact: {
          type: "network-transcript",
          title: "Packet Postcard network evidence",
          message:
            "Recovered packet transcript from a fictional training workstation. Follow the application conversation and reconstruct the repeated message pattern.",
          text: `
PACKET POSTCARD // TRAINING CAPTURE SUMMARY

Capture file: postcard-session.pcap
Interface: eth0
Filter used during recovery: tcp.port == 8088

STREAM 4
10.20.30.14:49152 -> 10.20.30.20:8088
POST /relay HTTP/1.1
Host: relay.training
Content-Type: text/plain

step=01;note=check
10.20.30.20:8088 -> 10.20.30.14:49152
HTTP/1.1 200 OK
message=keep_watching

step=02;note=archive
10.20.30.14:49152 -> 10.20.30.20:8088
POST /relay HTTP/1.1
message=keep_watching_repeat

step=03;note=signal
10.20.30.20:8088 -> 10.20.30.14:49152
HTTP/1.1 200 OK
message=postcard

step=04;note=signal
10.20.30.14:49152 -> 10.20.30.20:8088
POST /relay HTTP/1.1
message=postcard

STREAM 5
10.20.30.14:49153 -> 10.20.30.20:8088
POST /relay HTTP/1.1
message=NXTGENSEC{packet_postcard_decoy_03}

STREAM 4
10.20.30.14:49152 -> 10.20.30.20:8088
POST /relay HTTP/1.1
message=6c91e4ab

RECOVERY NOTE
The useful conversation repeats the same application-level marker before
the final token. Stream 5 is a separate conversation and was inserted
as a decoy.

ANALYST NOTE
Combine the challenge identifier with the recovered final token.
The decoy stream is not part of the authentic conversation.
          `.trim(),
          clue:
            "Follow Stream 4 and ignore the separate decoy stream. The repeated application marker identifies the relevant conversation and the final token completes the flag.",
        },
      });
    }

    if (challenge.slug === "shadowed-headers") {
      return res.json({
        artifact: {
          type: "network-headers",
          title: "Shadowed Headers evidence",
          message:
            "Recovered HTTP responses from a fictional debugging session. Read the headers in transmission order and identify the final authoritative value.",
          text: `
SHADOWED HEADERS // DEBUG CAPTURE

RESPONSE 1
HTTP/1.1 200 OK
X-Trace-ID: relay-17
X-Flag-State: placeholder
X-Relay-Mode: observe

RESPONSE 2
HTTP/1.1 200 OK
X-Trace-ID: relay-17
X-Flag-State: pending
X-Relay-Mode: observe

RESPONSE 3
HTTP/1.1 200 OK
X-Trace-ID: relay-17
X-Flag-State: verified
X-Relay-Mode: commit
X-Archive-Value: NXTGENSEC{shadowed_headers_decoy_17}

RESPONSE 4
HTTP/1.1 200 OK
X-Trace-ID: relay-17
X-Flag-State: verified
X-Relay-Mode: commit
X-Archive-Value: shadowed_headers_5e83a1c7

DEBUGGER NOTE
Headers from the same trace ID form one logical sequence.
Earlier values were intermediate states.
The final response is authoritative.
One flag-shaped value in the capture is intentionally misleading.

ANALYST INSTRUCTION
Use the authoritative archive value from the final response.
Preserve the NXTGENSEC flag format when submitting.
          `.trim(),
          clue:
            "Follow the same trace ID through all four responses. Intermediate values are superseded; the final response contains the value needed to identify the authentic flag.",
        },
      });
    }

    if (challenge.slug === "checksum-mirage") {
      return res.json({
        artifact: {
          type: "forensics-checksum",
          title: "Checksum Mirage evidence",
          message:
            "Recovered integrity records from a fictional evidence package. Compare the documented file details with the checksum records.",
          text: `
CHECKSUM MIRAGE // EVIDENCE PACKAGE

MANIFEST
File: incident_bundle.zip
Size: 18432 bytes
SHA256:
91a8c3f1d2e4b6078c19a2f56d73be0445c9a7d1e8f3046b2c17a9d8e531f640

INTEGRITY RECORD A
File: incident_bundle.zip
Size: 18432 bytes
SHA256:
91a8c3f1d2e4b6078c19a2f56d73be0445c9a7d1e8f3046b2c17a9d8e531f640
Status: ORIGINAL

INTEGRITY RECORD B
File: incident_bundle_modified.zip
Size: 18496 bytes
SHA256:
7d4c2e91a8f630be19c572d4a6103f8c9b27e541d03a6e1c4f98b2d7530c614e
Status: MODIFIED COPY

REVIEW NOTE
Record B was generated after one file was added to the package.
Record A matches the original manifest exactly.

FLAG CANDIDATES

NXTGENSEC{checksum_mirage_decoy_08}
NXTGENSEC{checksum_mirage_91c7e4b2}

ANALYST NOTE
The authentic flag is associated with the integrity record that matches
the original manifest. The modified package is not part of the original
evidence set.
          `.trim(),
          clue:
            "Compare Record A against the manifest. The matching checksum identifies the original evidence; the modified copy leads only to the decoy.",
        },
      });
    }

    if (challenge.slug === "fragmented-witness") {
      return res.json({
        artifact: {
          type: "osint-dossier",
          title: "Fragmented Witness archive",
          message:
            "Three fictional witness notes were recovered from different archive sections. Correlate the shared identifier and use the final archive record to resolve the authentic flag.",
          text: `
FRAGMENTED WITNESS // ARCHIVE RECOVERY

NOTE A
Location: intake/field-07
Witness: M. Rao
Reference: CASE-41 / KESTREL
Statement:
"Shipment review completed after the morning inventory check.
The archive clerk marked the KESTREL reference for follow-up."

NOTE B
Location: review/legacy-02
Witness: L. Kiran
Reference: KESTREL-41
Statement:
"The same case identifier appeared in the legacy index.
A later annotation changed the disposition from pending to retained."

NOTE C
Location: archive/final-01
Witness: archive.ops
Reference: RETAINED / 41-KESTREL
Statement:
"Cross-reference confirmed.
The retained identifier is KESTREL-41."

CORRELATION NOTE
A common identifier survives all three naming conventions:
KESTREL-41

DECOY RECORD
NXTGENSEC{fragmented_witness_decoy_27}

FINAL ARCHIVE TOKEN
64b9e2a1

ANALYST NOTE
Normalize the shared identifier to lowercase with an underscore,
then combine it with the final archive token.
The explicit decoy record is not part of the authentic archive path.
          `.trim(),
          clue:
            "Correlate the three witness references. The shared identifier is the key; normalize it consistently and combine it with the final archive token.",
        },
      });
    }

    if (challenge.slug === "blackbox-ledger") {
      return res.json({
        artifact: {
          type: "forensics-chain",
          title: "Blackbox Ledger evidence bundle",
          message:
            "Three recovered evidence fragments belong to the same audit chain. Determine the valid branch first, then reconstruct the identifier from the surviving fragments.",
          text: `
BLACKBOX LEDGER // CASE 8F
RECOVERY MODE: PARTIAL

ARCHIVE MAP

Node A
record_id: BL-41
parent: BL-40
integrity: PASS
payload: YmxhY2tib3g=

Node B
record_id: BL-42
parent: BL-41
integrity: PASS
payload: bGVkZ2Vy

Node C
record_id: BL-43
parent: BL-41
integrity: FAIL
payload: ZGVjb3k=

Node D
record_id: BL-44
parent: BL-42
integrity: PASS
payload: d56b9cf8

Node E
record_id: BL-45
parent: BL-43
integrity: FAIL
payload: 6465636f79

CHAIN RULE
A record can contribute to recovery only when:
1. its own integrity is PASS;
2. its parent is part of the valid chain;
3. it is not on a branch containing a failed integrity record.

SIDE NOTE // OPERATOR 17
The first two surviving payloads use standard Base64.
The final surviving payload is hexadecimal.

TRANSFORM NOTE
The final token is protected with this byte mask:

MASK
5A 5A 5A 5A

To recover the token:
- decode the final surviving hexadecimal payload into bytes;
- XOR each byte with the mask;
- render the result as lowercase hexadecimal.

VALIDATION MARK
The recovered token must contain exactly 8 hexadecimal characters.

DECOY MATERIAL
A failed branch contains a separate recovery value. It must not be used.

ANALYST NOTE
The challenge identifier is the normalized text recovered from the first
two valid payloads. The final token comes from the surviving terminal node.
Combine those two recovered components using the standard NXTGENSEC flag format.
          `.trim(),
          clue:
            "First establish the valid parent chain. Then decode the surviving payloads in their stated formats and apply the byte mask only to the terminal node.",
        },
      });
    }

    if (challenge.slug === "dead-signal") {
      return res.json({
        artifact: {
          type: "network-reconstruction",
          title: "Dead Signal recovery fragments",
          message:
            "Several fragments were recovered from a fictional failed communication session. Reconstruct the valid sequence before interpreting the payload.",
          text: `
DEAD SIGNAL // RECOVERY FRAGMENTS

FRAGMENT F-01
session: DS-17
seq: 01
status: VALID
payload: 44 53 2D 31 37

FRAGMENT F-02
session: DS-17
seq: 02
status: VALID
payload: 52 45 4C 41 59

FRAGMENT F-03
session: DS-19
seq: 02
status: VALID
payload: 4E 4F 49 53 45

FRAGMENT F-04
session: DS-17
seq: 03
status: CORRUPTED
payload: 7E 7E 7E 7E

FRAGMENT F-05
session: DS-17
seq: 04
status: VALID
payload: 7C 37 43 32 45

FRAGMENT F-06
session: DS-17
seq: 05
status: VALID
payload: 39 31 46 34

FRAGMENT F-07
session: DS-19
seq: 03
status: VALID
payload: NXTGENSEC{dead_signal_decoy_17}

REASSEMBLY NOTE

Only fragments from one session may be combined.
A valid sequence must:
- use increasing sequence numbers;
- exclude corrupted fragments;
- exclude fragments from other sessions.

TRANSFORM RECORD

The valid DS-17 payload bytes form an ASCII message.
The first block identifies the session.
The second block identifies the relay.
The final two blocks form a token separated by a boundary marker.

BOUNDARY MARKER
7C

RECOVERY CHECK
The reconstructed message contains exactly one boundary marker.
The right-hand side of that boundary is an 8-character hexadecimal token.

ANALYST NOTE
Do not use the obvious flag-shaped value from the unrelated session.
          `.trim(),
          clue:
            "First isolate the valid DS-17 sequence. Reassemble its payload bytes as ASCII, locate the boundary marker, and use the resulting token as the final recovery component.",
        },
      });
    }

    if (challenge.slug === "residual-memory") {
      return res.json({
        artifact: {
          type: "forensics-timeline",
          title: "Residual Memory evidence set",
          message:
            "Four partial workstation records were recovered after cleanup. Their timestamps, process relationships, and artifact references must be correlated.",
          text: `
RESIDUAL MEMORY // WORKSTATION CASE RM-04

FRAGMENT A // PROCESS RECORD
pid=4182
ppid=4011
started=08:41:13
image=reviewer.exe
artifact_ref=MEM-7B
integrity=PASS

FRAGMENT B // FILE CACHE
artifact_ref=MEM-7B
file=review.idx
last_seen=08:43:27
cache_state=retained

FRAGMENT C // PROCESS RECORD
pid=4217
ppid=4182
started=08:42:02
image=helper.exe
artifact_ref=MEM-7C
integrity=PASS

FRAGMENT D // CLEANUP LOG
timestamp=08:47:55
action=cache-prune
artifact_ref=MEM-7C
result=removed

FRAGMENT E // RECOVERED STRING TABLE
MEM-7B -> 52 4D 2D 30 34
MEM-7C -> 5A 5A 5A 5A
MEM-9A -> 4E 58 54 47

FRAGMENT F // LATE-GENERATED REPORT
generated=08:51:19
source=post-cleanup
artifact_ref=MEM-9A
status=synthetic

CORRELATION NOTES

1. A retained artifact must belong to a process that existed before cleanup.
2. A child process inherits the investigation context of its verified parent.
3. Post-cleanup synthetic reports are not part of the original execution chain.
4. The trusted artifact contains a four-byte ASCII prefix followed by a six-byte token.
5. The token is stored as hexadecimal bytes.
6. The byte sequence must be read in process order, not file order.

UNRELATED RECOVERY STRING
NXTGENSEC{residual_memory_decoy_63}

ANALYST MARK
The authentic recovery path begins at the earliest verified process and
continues only through retained artifacts connected to that process.
          `.trim(),
          clue:
            "Correlate the verified process tree with the retained artifact. Exclude the post-cleanup synthetic report, then decode the surviving byte sequence in process order.",
        },
      });
    }

    if (challenge.slug === "spectral-ledger") {
      return res.json({
        artifact: {
          type: "crypto-ledger",
          title: "Spectral Ledger recovery sheet",
          message:
            "A damaged key-recovery ledger contains overlapping records. Reconstruct the only valid chain, derive its ordering key, and recover the terminal token.",
          text: `
SPECTRAL LEDGER // ARCHIVE 17

ENTRY INDEX

A-04  90 22 70
A-09  D8 41 6E
B-02  51 31 A3
B-07  C3 28 F0
C-03  7A 15 D4
C-08  61 41 73
D-01  46 B7 92
D-06  80 30 62

SIGNATURE RULE

For each record:

R1 = (first_byte XOR third_byte) mod 16
R2 = (second_byte + first_byte) mod 16
R3 = (third_byte XOR second_byte) mod 16

The record signature is:

[R1][R2][R3]

CHAIN VALIDATION

For every adjacent pair:

1. The next record's first signature nibble must equal
   the current record's R3 nibble.

2. The next record's first signature nibble must also equal
   the current record's R2 nibble.

3. The four selected records must use four different archive
   sections: A, B, C, D.

4. The terminal record must be the only selected record whose
   revision marker is FINAL.

REVISION REGISTER

A-04 = ORIGINAL
B-02 = CURRENT
C-08 = CURRENT
D-06 = FINAL

The other listed records belong to alternate revisions.

RECONSTRUCTION SHEET

slot-0 = A-04
slot-1 = B-02
slot-2 = ?
slot-3 = D-06

Do not assume the checkpoint order is correct.
The section labels are historical metadata, not execution order.

CHECKPOINT FRAGMENTS

RIFT-1
A-04 / B-02 / C-08 / D-06

RIFT-2
A-04 / B-07 / C-03 / D-06

RIFT-3
A-09 / B-02 / C-08 / D-01

Only the chain satisfying every validation rule is retained.

SIGMA RECORD

payload:
A6 E0 DB 1C

terminal_class:
SIGMA

ORDERING KEY

For each retained record, take the second and third signature
nibbles and combine them into one byte.

Read the four resulting bytes in retained chain order.

RECOVERY OPERATION

Apply the four-byte ordering key to the SIGMA payload with a
byte-for-byte XOR.

Interpret the resulting four bytes as lowercase hexadecimal text.

The result is the terminal recovery token.

UNVERIFIED ARCHIVE COPY

A later revision contains this flag-shaped value:

NXTGENSEC{spectral_ledger_3a71d0c5}

Its revision status is REJECTED.

FINAL AUDIT NOTE

The authentic token is not stored as readable flag text anywhere
in this recovery sheet. It must be reconstructed from the retained
chain and SIGMA payload.
          `.trim(),
          clue:
            "Compute the three-nibble signatures first. The valid chain must satisfy both link conditions and the revision register before the SIGMA payload can be decoded.",
        },
      });
    }

    if (challenge.slug === "cold-trace") {
      return res.json({
        artifact: {
          type: "reverse-engineering-trace",
          title: "Cold Trace execution evidence",
          message:
            "A partial execution trace and recovery table were recovered from a fictional utility. Reconstruct the actual control-flow path and correlate it with the retained state record.",
          text: `
COLD TRACE // UTILITY CT-9

INITIAL STATE
R0 = 0x5A
R1 = 0x3C
R2 = 0x19

BLOCK A
01: MOV R3, R0
02: XOR R3, R1
03: ADD R3, 0x05
04: CMP R3, 0x6B
05: JEQ BLOCK_C
06: SUB R3, R2
07: XOR R3, 0x22
08: CMP R3, 0x52
09: JEQ BLOCK_B
10: JMP BLOCK_D

BLOCK B
11: ADD R3, 0x0E
12: XOR R3, R1
13: CMP R3, 0x4A
14: JEQ BLOCK_E
15: JMP BLOCK_D

BLOCK C
16: XOR R3, 0x44
17: ROL R3, 2
18: CMP R3, 0xBC
19: JEQ BLOCK_E
20: JMP BLOCK_D

BLOCK D
21: XOR R3, 0x11
22: SUB R3, 0x08
23: CMP R3, 0x30
24: JNE REJECT
25: JMP BLOCK_E

BLOCK E
26: XOR R3, 0x3D
27: AND R3, 0xFF
28: STORE R3 -> STATE

RECOVERY TABLE

STATE S-07
source = BLOCK-B
integrity = PASS
payload = 18 72 66 74

STATE S-14
source = BLOCK-C
integrity = PASS
payload = 91 9F AD E4

STATE S-19
source = BLOCK-E
integrity = PASS
payload = 9D 97 AD 94

STATE S-23
source = POST-CLEANUP
integrity = FAIL
payload = 77 12 44 90

SECONDARY TRANSFORM

Only the terminal state reached by the executed branch is eligible.

For the retained terminal state, compare the payload bytes with the
associated four-byte mask:

mask = 00 D5 5A 25

Apply the mask byte-for-byte and interpret the result as lowercase
hexadecimal text.

CONTROL-FLOW NOTE

The branch instructions are evaluated using the value of R3 at that point.
Do not assume the listing order is the execution order.

ANALYST COPY

A separate recovery sheet contains another flag-shaped value:

NXTGENSEC{cold_trace_6a10c2e4}

That value came from an alternate analysis path and is not the authentic
submission.

VALIDATION NOTE

The authentic recovery token is the hexadecimal result associated with
the retained terminal state. The challenge identifier is used by the
platform's validation layer.
          `.trim(),
          clue:
            "Trace R3 from BLOCK A through the conditional branches. Then select the retained record whose source matches the terminal block actually reached.",
        },
      });
    }

    if (challenge.slug === "web-foundations") {
      return res.json({
        artifact: {
          type: "html-inspection",
          title: "Web Foundations training artifact",
          message:
            "Inspect this artifact carefully. The value below is encoded for the exercise.",
          encoding: "base64",
          value: "TlhUR0VOU0VDe3dlYl9mb3VuZGF0aW9uc18wMX0=",
          clue:
            "Decode the value using Base64 to recover the training flag.",
        },
      });
    }

    if (challenge.slug === "html-metadata") {
      return res.json({
        artifact: {
          type: "html-metadata",
          title: "HTML Metadata training artifact",
          message:
            "Inspect the HTML metadata carefully. One metadata value is intentionally exposed for this exercise.",
          html: `
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="description" content="NXTGENSEC training page">
  <meta name="author" content="NXTGENSEC">
  <meta name="training-code" content="html_metadata_01">
  <title>NXTGENSEC HTML Metadata Training</title>
</head>
<body>
  <h1>HTML Metadata Training</h1>
  <p>Inspect the page source and review the metadata.</p>
</body>
</html>
          `.trim(),
          clue:
            "View the page source and inspect the meta tags in the <head> section.",
        },
      });
    }

    if (challenge.slug === "source-code-clue") {
      return res.json({
        artifact: {
          type: "source-code-clue",
          title: "Source Code Clue training artifact",
          message:
            "Inspect the HTML source carefully. A comment in the page contains the clue for this exercise.",
          html: `
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>NXTGENSEC Source Code Clue Training</title>
</head>
<body>
  <!-- NXTGENSEC training clue: source_code_clue_01 -->
  <h1>Source Code Clue</h1>
  <p>Review the page source to find the hidden training clue.</p>
</body>
</html>
          `.trim(),
          clue:
            "View the page source and inspect the HTML comments.",
        },
      });
    }

    if (challenge.slug === "terminal-footprints") {
      return res.json({
        artifact: {
          type: "terminal-log",
          title: "Terminal Footprints evidence",
          message:
            "A recovered shell-history fragment contains a suspicious sequence. Reconstruct the sequence instead of trusting isolated lines.",
          text: `
# recovered .bash_history fragment

$ whoami
analyst

$ pwd
/home/analyst

$ ls
notes.txt  archive  tools

$ cat notes.txt
backup review started

$ history | tail -12
  481  grep -R "training" ./archive
  482  cat ./archive/session.txt
  483  tr 'A-Z' 'N-ZA-M' < ./archive/session.txt
  484  echo "NXTGENSEC{terminal_decoy_17b9}"
  485  printf '%s' 'AKGTRAFRP{grezvany_genpr_58p2r91s}'
  486  history -c
  487  exit

Recovered analyst note:
"Command 483 transforms the interesting sequence.
Do not mistake the visible flag-shaped string for the recovered value."

The relevant transformation is ROT13.
      `.trim(),
          clue:
            "Follow commands 483 and 485. Decode the transformed value and compare it against the visible flag-shaped decoy.",
        },
      });
    }
    if (challenge.slug === "echoes-in-exif") {
      return res.json({
        artifact: {
          type: "forensics-image",
          title: "Echoes in EXIF evidence",
          message:
            "Analyze the recovered JPEG and inspect its EXIF metadata carefully.",
          image: "/echoes-in-exif.jpg",
          clue:
            "Compare the descriptive metadata with the less obvious EXIF fields. One flag-shaped value is a deliberate decoy.",
        },
      });
    }
    if (challenge.slug === "broken-cipher") {
      return res.json({
        artifact: {
          type: "crypto-text",
          title: "Broken Cipher evidence",
          message:
            "Two intercepted messages were encrypted with the same repeating XOR keystream. Recover the reused keystream and decrypt both messages.",
          text: `
BROKEN CIPHER // RECOVERED TRANSMISSIONS

Ciphertext A:
212a362e31633f24374e3f525f2e273621316338283749273b3128372c3a316e1715031d1a17000b2d090c0d5e18131115043c5c5e16550a404c54044609

Ciphertext B:
212a362e31633f24374e3f525f2b3721262d6b20203349273b3128372c3a316e1703061b02060b30110b191c481e3e10110a0c1c304603504550

Observed plaintext prefix:
NXTGENSEC:V1:

Known design notes:
- Both messages were encrypted using repeating-key XOR.
- The same key was accidentally reused.
- Key length: 13 bytes.
- Both plaintexts begin with the observed prefix.
- One decrypted message contains the authentic flag.
- The other contains a deliberately constructed decoy flag.

Recover the 13-byte keystream from the known prefix, then decrypt both ciphertexts.
          `.trim(),
          clue:
            "Use the known 13-byte plaintext prefix to recover every byte of the repeating key. Then apply that key cyclically to both ciphertexts and compare the two recovered messages.",
        },
      });
    }
    if (challenge.slug === "silent-pixels") {
      return res.json({
        artifact: {
          type: "image-steganography",
          title: "Silent Pixels training artifact",
          message:
            "Analyze this image carefully. Its visible appearance is only the surface layer.",
          image: "/silent-pixels.png",
          clue:
            "Investigate both the PNG structure and the pixel data. One discovered flag-shaped value is deliberately misleading.",
        },
      });
    }
    if (challenge.slug === "robots-trail") {
      return res.json({
        artifact: {
          type: "robots-txt",
          title: "Robots Trail training artifact",
          message:
            "Inspect the robots.txt file carefully. One path is intentionally mentioned for this exercise.",
          text: `
User-agent: *
Disallow: /admin/
Disallow: /internal-training/

# NXTGENSEC training path: /training/robots-trail-02
          `.trim(),
          clue:
            "Read the robots.txt entries and pay attention to the training path.",
        },
      });
    }

    return res.status(404).json({
      error: "Challenge artifact not available",
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listChallenges,
  getChallengeBySlug,
  createChallenge,
  publishChallenge,
  archiveChallenge,
  getChallengeStatus,
  getChallengeArtifact,
};






