-- NXTGENSEC CTF
-- Initial production-oriented schema
-- PostgreSQL 18+

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =========================================================
-- ENUMS
-- =========================================================

CREATE TYPE user_role AS ENUM (
    'PLAYER',
    'ADMIN'
);

CREATE TYPE event_status AS ENUM (
    'DRAFT',
    'SCHEDULED',
    'ACTIVE',
    'COMPLETED',
    'ARCHIVED'
);

CREATE TYPE challenge_state AS ENUM (
    'DRAFT',
    'SCHEDULED',
    'PUBLISHED',
    'ARCHIVED'
);

CREATE TYPE difficulty_level AS ENUM (
    'BEGINNER',
    'EASY',
    'MEDIUM',
    'HARD',
    'EXPERT'
);

CREATE TYPE challenge_category AS ENUM (
    'WEB',
    'CRYPTOGRAPHY',
    'FORENSICS',
    'OSINT',
    'LINUX',
    'NETWORKING',
    'REVERSE_ENGINEERING',
    'MISCELLANEOUS'
);

-- =========================================================
-- USERS
-- =========================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    username VARCHAR(32) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash TEXT NOT NULL,

    role user_role NOT NULL DEFAULT 'PLAYER',

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login_at TIMESTAMPTZ,

    CONSTRAINT users_username_unique UNIQUE (username),
    CONSTRAINT users_email_unique UNIQUE (email),

    CONSTRAINT users_username_format
        CHECK (username ~ '^[A-Za-z0-9_]{3,32}$'),

    CONSTRAINT users_email_format
        CHECK (position('@' IN email) > 1)
);

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at);

-- =========================================================
-- EVENTS / SEASONS
-- =========================================================

CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(120) NOT NULL,
    slug VARCHAR(140) NOT NULL,

    description TEXT NOT NULL DEFAULT '',

    status event_status NOT NULL DEFAULT 'DRAFT',

    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ NOT NULL,

    challenges_per_day_min INTEGER NOT NULL DEFAULT 10,
    challenges_per_day_max INTEGER NOT NULL DEFAULT 15,

    created_by UUID REFERENCES users(id) ON DELETE SET NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT events_slug_unique UNIQUE(slug),

    CONSTRAINT events_dates_valid
        CHECK (end_at > start_at),

    CONSTRAINT events_daily_min_valid
        CHECK (challenges_per_day_min >= 1),

    CONSTRAINT events_daily_max_valid
        CHECK (
            challenges_per_day_max >= challenges_per_day_min
        )
);

CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_start_at ON events(start_at);
CREATE INDEX idx_events_end_at ON events(end_at);

-- =========================================================
-- EVENT DAYS
-- =========================================================

CREATE TABLE event_days (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    event_id UUID NOT NULL
        REFERENCES events(id)
        ON DELETE CASCADE,

    day_number INTEGER NOT NULL,

    name VARCHAR(120),

    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT event_days_unique_day
        UNIQUE(event_id, day_number),

    CONSTRAINT event_days_day_positive
        CHECK(day_number >= 1),

    CONSTRAINT event_days_dates_valid
        CHECK(end_at > start_at)
);

CREATE INDEX idx_event_days_event
    ON event_days(event_id);

CREATE INDEX idx_event_days_start_at
    ON event_days(start_at);

-- =========================================================
-- CHALLENGES
-- =========================================================

CREATE TABLE challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    event_id UUID NOT NULL
        REFERENCES events(id)
        ON DELETE CASCADE,

    event_day_id UUID
        REFERENCES event_days(id)
        ON DELETE SET NULL,

    title VARCHAR(160) NOT NULL,
    slug VARCHAR(180) NOT NULL,

    description TEXT NOT NULL,

    category challenge_category NOT NULL,

    difficulty difficulty_level NOT NULL,

    points INTEGER NOT NULL,

    state challenge_state NOT NULL DEFAULT 'DRAFT',

    flag_hash TEXT NOT NULL,

    hint TEXT,

    author_name VARCHAR(100),

    release_at TIMESTAMPTZ,
    archive_at TIMESTAMPTZ,

    is_final BOOLEAN NOT NULL DEFAULT FALSE,
    final_order INTEGER,

    attachment_url TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT challenges_slug_unique UNIQUE(slug),

    CONSTRAINT challenges_points_positive
        CHECK(points > 0),

    CONSTRAINT challenges_final_order_valid
        CHECK(
            final_order IS NULL
            OR final_order BETWEEN 1 AND 4
        ),

    CONSTRAINT challenges_final_consistency
        CHECK(
            (is_final = FALSE AND final_order IS NULL)
            OR
            (is_final = TRUE AND final_order IS NOT NULL)
        ),

    CONSTRAINT challenges_archive_after_release
        CHECK(
            archive_at IS NULL
            OR release_at IS NULL
            OR archive_at > release_at
        )
);

CREATE INDEX idx_challenges_event
    ON challenges(event_id);

CREATE INDEX idx_challenges_event_day
    ON challenges(event_day_id);

CREATE INDEX idx_challenges_state
    ON challenges(state);

CREATE INDEX idx_challenges_category
    ON challenges(category);

CREATE INDEX idx_challenges_difficulty
    ON challenges(difficulty);

CREATE INDEX idx_challenges_release_at
    ON challenges(release_at);

CREATE UNIQUE INDEX idx_one_final_order_per_event
    ON challenges(event_id, final_order)
    WHERE is_final = TRUE;

-- =========================================================
-- SUBMISSIONS
-- =========================================================

CREATE TABLE submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    challenge_id UUID NOT NULL
        REFERENCES challenges(id)
        ON DELETE CASCADE,

    submitted_flag TEXT NOT NULL,

    is_correct BOOLEAN NOT NULL DEFAULT FALSE,

    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_submissions_user
    ON submissions(user_id);

CREATE INDEX idx_submissions_challenge
    ON submissions(challenge_id);

CREATE INDEX idx_submissions_submitted_at
    ON submissions(submitted_at);

CREATE INDEX idx_submissions_user_challenge
    ON submissions(user_id, challenge_id);

-- =========================================================
-- SOLVES
-- =========================================================

CREATE TABLE solves (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    challenge_id UUID NOT NULL
        REFERENCES challenges(id)
        ON DELETE CASCADE,

    points_awarded INTEGER NOT NULL,

    solved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT solves_unique_user_challenge
        UNIQUE(user_id, challenge_id),

    CONSTRAINT solves_points_positive
        CHECK(points_awarded > 0)
);

CREATE INDEX idx_solves_user
    ON solves(user_id);

CREATE INDEX idx_solves_challenge
    ON solves(challenge_id);

CREATE INDEX idx_solves_solved_at
    ON solves(solved_at);

-- =========================================================
-- ACHIEVEMENTS
-- =========================================================

CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    code VARCHAR(80) NOT NULL,
    name VARCHAR(120) NOT NULL,
    description TEXT NOT NULL,

    icon VARCHAR(100),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT achievements_code_unique UNIQUE(code)
);

-- =========================================================
-- USER ACHIEVEMENTS
-- =========================================================

CREATE TABLE user_achievements (
    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    achievement_id UUID NOT NULL
        REFERENCES achievements(id)
        ON DELETE CASCADE,

    awarded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY(user_id, achievement_id)
);

CREATE INDEX idx_user_achievements_user
    ON user_achievements(user_id);

-- =========================================================
-- AUDIT LOG
-- =========================================================

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    actor_user_id UUID
        REFERENCES users(id)
        ON DELETE SET NULL,

    action VARCHAR(100) NOT NULL,

    entity_type VARCHAR(80),
    entity_id UUID,

    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_actor
    ON audit_logs(actor_user_id);

CREATE INDEX idx_audit_logs_entity
    ON audit_logs(entity_type, entity_id);

CREATE INDEX idx_audit_logs_created_at
    ON audit_logs(created_at);

-- =========================================================
-- UPDATED_AT TRIGGER
-- =========================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER events_updated_at
BEFORE UPDATE ON events
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER event_days_updated_at
BEFORE UPDATE ON event_days
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER challenges_updated_at
BEFORE UPDATE ON challenges
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =========================================================
-- INITIAL ACHIEVEMENTS
-- =========================================================

INSERT INTO achievements
    (code, name, description, icon)
VALUES
    (
        'FIRST_SOLVE',
        'First Solve',
        'Solve your first challenge.',
        'flag'
    ),
    (
        'FIRST_BLOOD',
        'First Blood',
        'Be the first player to solve a challenge.',
        'zap'
    ),
    (
        'TEN_SOLVES',
        'Ten Solves',
        'Solve ten challenges.',
        'target'
    ),
    (
        'TWENTY_FIVE_SOLVES',
        'Twenty Five Solves',
        'Solve twenty-five challenges.',
        'trophy'
    ),
    (
        'WEB_SPECIALIST',
        'Web Specialist',
        'Solve multiple Web challenges.',
        'globe'
    ),
    (
        'CRYPTO_SPECIALIST',
        'Crypto Specialist',
        'Solve multiple Cryptography challenges.',
        'key'
    ),
    (
        'FORENSICS_SPECIALIST',
        'Forensics Specialist',
        'Solve multiple Forensics challenges.',
        'search'
    ),
    (
        'OSINT_HUNTER',
        'OSINT Hunter',
        'Solve multiple OSINT challenges.',
        'radar'
    ),
    (
        'LINUX_SPECIALIST',
        'Linux Specialist',
        'Solve multiple Linux challenges.',
        'terminal'
    ),
    (
        'REVERSE_ENGINEER',
        'Reverse Engineer',
        'Solve multiple Reverse Engineering challenges.',
        'binary'
    ),
    (
        'EVENT_FINISHER',
        'Event Finisher',
        'Complete an event with at least one solve.',
        'award'
    )
ON CONFLICT (code) DO NOTHING;

COMMIT;