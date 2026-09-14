import React, { useEffect, useState } from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  NavLink,
  Navigate,
  useNavigate,
  useParams,
} from "react-router-dom";

import "./App.css";

import { AuthProvider, useAuth } from "./auth/AuthContext";

import {
  getMyStats,
  getEvents,
  getEventBySlug,
  createEvent,
  getEventDays,
  createEventDay,
  getChallenges,
  getChallengeBySlug,
  getChallengeStatus,
  getChallengeArtifact,
  submitFlag,
  createChallenge,
  publishChallenge,
  archiveChallenge,
  getLeaderboard,
} from "./api/client";

/* =========================
   NAVBAR
========================= */

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="navbar">
      <Link to="/" className="brand">
        <img
  src="/nxtgensec-logo.png"
  alt="NXTGENSEC"
  className="brand-logo-image"
/>
        <span>NXTGENSEC</span>
      </Link>

      <nav className="nav-links">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/events">Events</NavLink>
        <NavLink to="/leaderboard">Leaderboard</NavLink>
        <NavLink to="/about">About</NavLink>
      </nav>

      <div className="nav-actions">
        {user ? (
          <>
            <Link to="/dashboard" className="button button-ghost">
              Dashboard
            </Link>

            {user.role === "ADMIN" && (
              <Link to="/admin" className="button button-ghost">
                Admin
              </Link>
            )}

            <button
              className="button button-primary"
              onClick={logout}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="button button-ghost">
              Login
            </Link>

            <Link to="/register" className="button button-primary">
              Join CTF
            </Link>
          </>
        )}
      </div>
    </header>
  );
}

/* =========================
   PROTECTED ROUTES
========================= */

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Page eyebrow="NXTGENSEC" title="Loading...">
        <div className="page-card">
          <p>Checking authentication...</p>
        </div>
      </Page>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Page eyebrow="NXTGENSEC" title="Loading...">
        <div className="page-card">
          <p>Checking administrator access...</p>
        </div>
      </Page>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "ADMIN") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

/* =========================
   HOME
========================= */

function Home() {
  return (
    <>
      <section className="hero home-hero">
        <div className="hero-content">
          <span className="eyebrow">NXTGENSEC CTF PLATFORM</span>

          <h1>
            Think.
            <br />
            <span className="green">Break.</span>
            <br />
            Learn.
          </h1>

          <p>
            A competitive cybersecurity platform built for hands-on
            learning, realistic challenges, and security competitions.
          </p>

          <div className="hero-actions">
            <Link
              to="/events"
              className="button button-primary button-large"
            >
              Explore Season 01
            </Link>

            <Link
              to="/dashboard"
              className="button button-ghost button-large"
            >
              Open Dashboard
            </Link>
          </div>

          <div className="home-quick-stats">
            <div>
              <strong>45</strong>
              <span>Competition Challenges</span>
            </div>

            <div>
              <strong>08</strong>
              <span>Security Disciplines</span>
            </div>

            <div>
              <strong>03</strong>
              <span>Competition Days</span>
            </div>
          </div>
        </div>

        <div className="hero-panel">
          <div className="terminal">
            <div className="terminal-header">
              <span />
              <span />
              <span />
            </div>

            <div className="terminal-body">
              <p>
                <span className="blue">$</span> nxtgensec status
              </p>

              <p className="green-text">
                platform: online
              </p>

              <p>
                season: <strong>01</strong>
              </p>

              <p>
                challenges: <strong>45</strong>
              </p>

              <p>
                disciplines: <strong>08</strong>
              </p>

              <p>
                mode: <strong>competitive</strong>
              </p>

              <p>
                objective: <strong>learn security</strong>
              </p>

              <p className="cursor">_</p>
            </div>
          </div>

          <div className="home-terminal-note">
            <span className="blue">STATUS</span>
            <strong>All systems operational</strong>
          </div>
        </div>
      </section>

      <section className="section home-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">SEASON 01</span>
            <h2>Built for real problem solving</h2>
          </div>

          <span className="status-badge status-live">
            PLATFORM ONLINE
          </span>
        </div>

        <div className="home-feature-grid">
          <article className="home-feature-card">
            <span className="home-feature-number">01</span>
            <h3>Hands-on challenges</h3>
            <p>
              Solve practical cybersecurity problems across multiple
              disciplines instead of memorizing theory.
            </p>
          </article>

          <article className="home-feature-card">
            <span className="home-feature-number">02</span>
            <h3>Progress that matters</h3>
            <p>
              Earn points, track completed challenges, and see your
              progress build throughout the competition.
            </p>
          </article>

          <article className="home-feature-card">
            <span className="home-feature-number">03</span>
            <h3>Competitive by design</h3>
            <p>
              Every solve contributes to a live leaderboard while
              keeping the focus on learning and technical skill.
            </p>
          </article>
        </div>
      </section>

      <section className="section home-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">DISCIPLINES</span>
            <h2>Eight ways to test your skills</h2>
          </div>
        </div>

        <div className="discipline-grid">
          <div className="discipline-card">
            <span>01</span>
            <strong>Web Security</strong>
          </div>

          <div className="discipline-card">
            <span>02</span>
            <strong>Cryptography</strong>
          </div>

          <div className="discipline-card">
            <span>03</span>
            <strong>Forensics</strong>
          </div>

          <div className="discipline-card">
            <span>04</span>
            <strong>OSINT</strong>
          </div>

          <div className="discipline-card">
            <span>05</span>
            <strong>Linux</strong>
          </div>

          <div className="discipline-card">
            <span>06</span>
            <strong>Networking</strong>
          </div>

          <div className="discipline-card">
            <span>07</span>
            <strong>Reverse Engineering</strong>
          </div>

          <div className="discipline-card">
            <span>08</span>
            <strong>Miscellaneous</strong>
          </div>
        </div>
      </section>

      <section className="section home-section">
        <div className="event-card home-season-card">
          <div>
            <span className="event-label">NXTGENSEC SEASON 01</span>

            <h3>
              Three days. Forty-five challenges. One leaderboard.
            </h3>

            <p>
              Start with foundational problems and work toward harder
              investigations involving web security, cryptography,
              forensics, OSINT, Linux, networking, reverse engineering,
              and miscellaneous challenges.
            </p>

            <div className="hero-actions">
              <Link
                to="/events"
                className="button button-primary"
              >
                View Competition
              </Link>

              <Link
                to="/leaderboard"
                className="button button-ghost"
              >
                View Leaderboard
              </Link>
            </div>
          </div>

          <div className="home-season-panel">
            <span className="eyebrow">FORMAT</span>

            <div className="home-format-row">
              <strong>DAY 01</strong>
              <span>15 challenges</span>
            </div>

            <div className="home-format-row">
              <strong>DAY 02</strong>
              <span>15 challenges</span>
            </div>

            <div className="home-format-row">
              <strong>DAY 03</strong>
              <span>15 challenges</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadEvents() {
      try {
        const data = await getEvents();
        setEvents(data.events || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, []);

  return (
    <Page eyebrow="COMPETITIONS" title="Events">
      {loading && (
        <div className="page-card">
          <p>Loading events...</p>
        </div>
      )}

      {error && (
        <div className="form-error">
          {error}
        </div>
      )}

      {!loading && !error && events.length === 0 && (
        <div className="page-card">
          <p>No public events are currently available.</p>
        </div>
      )}

      <div className="event-list">
        {events.map((event) => (
          <div className="event-card" key={event.id}>
            <div>
              <span className="event-label">
                {event.status}
              </span>

              <h3>{event.name}</h3>

              <p>
                {event.description ||
                  "NXTGENSEC cybersecurity competition."}
              </p>
            </div>

            <div className="event-meta">
              <div>
                <span>START</span>
                <strong>
                  {new Date(event.start_at).toLocaleString()}
                </strong>
              </div>

              <div>
                <span>END</span>
                <strong>
                  {new Date(event.end_at).toLocaleString()}
                </strong>
              </div>

              <Link
                to={`/events/${event.slug}`}
                className="button button-primary"
              >
                View Event
              </Link>
            </div>
          </div>
        ))}
      </div>
    </Page>
  );
}

/* =========================
   SEASON ONE
========================= */

function SeasonOne() {
  const [event, setEvent] = useState(null);
  const [days, setDays] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSeason() {
      try {
        setLoading(true);
        setError("");

        const eventData = await getEventBySlug("season-01");
        const currentEvent = eventData.event;

        if (!currentEvent) {
          throw new Error("Season 01 event was not found.");
        }

        setEvent(currentEvent);

        const [daysData, challengesData] = await Promise.all([
          getEventDays(currentEvent.id),
          getChallenges(currentEvent.id),
        ]);

        setDays(daysData.days || []);
        setChallenges(challengesData.challenges || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadSeason();
  }, []);

  function getChallengesForDay(dayId) {
    return challenges.filter(
      (challenge) => challenge.event_day_id === dayId
    );
  }

  function difficultyLabel(difficulty) {
    return String(difficulty || "")
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  function difficultyKey(difficulty) {
    return String(difficulty || "").toUpperCase();
  }

  function difficultyDescription(difficulty) {
    const key = difficultyKey(difficulty);

    if (key === "EASY") {
      return "Foundational investigations and focused analysis.";
    }

    if (key === "MEDIUM") {
      return "Multi-step problems requiring deeper correlation.";
    }

    if (key === "HARD") {
      return "Advanced investigations with layered evidence.";
    }

    return "Competition challenge.";
  }

  const difficultyOrder = ["EASY", "MEDIUM", "HARD"];

  if (loading) {
    return (
      <Page eyebrow="EVENT" title="NXTGENSEC Season 01">
        <div className="page-card">
          <p>Loading competition data...</p>
        </div>
      </Page>
    );
  }

  return (
    <Page
      eyebrow="EVENT"
      title={event?.name || "NXTGENSEC Season 01"}
    >
      {error && <div className="form-error">{error}</div>}

      <section className="season-overview">
        <div className="season-overview-main">
          <span className="eyebrow">SEASON 01</span>
          <h2>{event?.name || "NXTGENSEC Season 01"}</h2>

          <p>
            {event?.description ||
              "Three challenge days are scheduled for the competition."}
          </p>
        </div>

        <div className="season-overview-side">
          <span className="status-badge">
            {event?.status || "COMING SOON"}
          </span>

          <strong>45</strong>
          <span>Total competition challenges</span>
        </div>
      </section>

      <section className="season-day-nav">
        {days.map((day) => {
          const dayChallenges = getChallengesForDay(day.id);

          return (
            <div className="season-day-tab" key={day.id}>
              <span>
                DAY {String(day.day_number).padStart(2, "0")}
              </span>

              <strong>
                {day.name || `Day ${day.day_number}`}
              </strong>

              <small>
                {dayChallenges.length} challenges
              </small>
            </div>
          );
        })}
      </section>

      {days.map((day) => {
        const dayChallenges = getChallengesForDay(day.id);

        return (
          <section className="season-day-section" key={day.id}>
            <div className="season-day-header">
              <div>
                <span className="eyebrow">
                  DAY {String(day.day_number).padStart(2, "0")}
                </span>

                <h2>
                  {day.name || `Day ${day.day_number}`}
                </h2>

                <p>
                  {new Date(day.start_at).toLocaleString()}
                </p>
              </div>

              <div className="season-day-total">
                <strong>{dayChallenges.length}</strong>
                <span>Challenges</span>
              </div>
            </div>

            {dayChallenges.length === 0 ? (
              <div className="page-card">
                <p>
                  No challenges are currently available for this day.
                </p>
              </div>
            ) : (
              <div className="difficulty-groups">
                {difficultyOrder.map((difficulty) => {
                  const groupedChallenges = dayChallenges.filter(
                    (challenge) =>
                      difficultyKey(challenge.difficulty) === difficulty
                  );

                  if (groupedChallenges.length === 0) {
                    return null;
                  }

                  return (
                    <section
                      className={`difficulty-section difficulty-${difficulty.toLowerCase()}`}
                      key={difficulty}
                    >
                      <div className="difficulty-heading">
                        <div>
                          <span className="difficulty-kicker">
                            {difficulty}
                          </span>

                          <h3>{difficultyLabel(difficulty)}</h3>

                          <p>
                            {difficultyDescription(difficulty)}
                          </p>
                        </div>

                        <span className="difficulty-count">
                          {groupedChallenges.length}
                        </span>
                      </div>

                      <div className="season-challenge-grid">
                        {groupedChallenges.map((challenge) => (
                          <article
                            className="season-challenge-card"
                            key={challenge.id}
                          >
                            <div className="season-challenge-top">
                              <span className="challenge-category">
                                {String(challenge.category || "")
                                  .replaceAll("_", " ")}
                              </span>

                              {challenge.is_final && (
                                <span className="challenge-final">
                                  FINAL
                                </span>
                              )}
                            </div>

                            <div className="season-challenge-body">
                              <h3>{challenge.title}</h3>

                              <div className="season-challenge-meta">
                                <span>
                                  {difficultyLabel(
                                    challenge.difficulty
                                  )}
                                </span>

                                <strong>
                                  {challenge.points} PTS
                                </strong>
                              </div>
                            </div>

                            <Link
                              to={`/challenges/${encodeURIComponent(
                                challenge.slug
                              )}`}
                              className="season-challenge-button"
                            >
                              Open Challenge
                            </Link>
                          </article>
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>
            )}
          </section>
        );
      })}

      {days.length === 0 && (
        <div className="page-card">
          <p>No competition days are configured yet.</p>
        </div>
      )}
    </Page>
  );
}
/* =========================
   LEADERBOARD
========================= */

function Leaderboard() {
  return (
    <Page eyebrow="COMPETE" title="Leaderboard">
      <div className="page-card">
        <p>
          The live competition leaderboard will be
          connected here.
        </p>
      </div>
    </Page>
  );
}

/* =========================
   ABOUT
========================= */

function About() {
  return (
    <Page eyebrow="PLATFORM" title="About NXTGENSEC">
      <div className="page-card">
        <h2>Learn by solving.</h2>

        <p>
          NXTGENSEC is a cybersecurity CTF platform
          focused on practical security learning,
          competitions, and hands-on challenges.
        </p>

        <p>
          Players can solve challenges, submit flags,
          earn points, track statistics, and compete
          on the leaderboard.
        </p>
      </div>
    </Page>
  );
}

/* =========================
   LOGIN
========================= */

function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSubmitting(true);

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Page eyebrow="PLAYER ACCESS" title="Login">
      <form
        className="auth-card"
        onSubmit={handleSubmit}
      >
        <h2>Welcome back.</h2>

        {error && (
          <div className="form-error">
            {error}
          </div>
        )}

        <label>Email</label>

        <input
          type="email"
          value={email}
          onChange={(event) =>
            setEmail(event.target.value)
          }
          placeholder="********"
          required
        />

        <label>Password</label>

        <input
          type="password"
          value={password}
          onChange={(event) =>
            setPassword(event.target.value)
          }
          placeholder="********"
          required
        />

        <button
          type="submit"
          className="button button-primary button-full"
          disabled={submitting}
        >
          {submitting ? "Logging in..." : "Login"}
        </button>

        <p className="auth-footer">
          Don't have an account?{" "}
          <Link to="/register">
            Create one
          </Link>
        </p>
      </form>
    </Page>
  );
}

/* =========================
   REGISTER
========================= */

function Register() {
  const { user, register } = useAuth();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      await register(username, email, password);

      setSuccess(
        "Account created successfully. You can now log in."
      );

      setUsername("");
      setEmail("");
      setPassword("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Page
      eyebrow="CREATE ACCOUNT"
      title="Join NXTGENSEC"
    >
      <form
        className="auth-card"
        onSubmit={handleSubmit}
      >
        <h2>Create your player account.</h2>

        {error && (
          <div className="form-error">
            {error}
          </div>
        )}

        {success && (
          <div className="form-success">
            {success}
          </div>
        )}

        <label>Username</label>

        <input
          type="text"
          value={username}
          onChange={(event) =>
            setUsername(event.target.value)
          }
          placeholder="security_player"
          minLength={3}
          maxLength={32}
          required
        />

        <label>Email</label>

        <input
          type="email"
          value={email}
          onChange={(event) =>
            setEmail(event.target.value)
          }
          placeholder="you@example.com"
          required
        />

        <label>Password</label>

        <input
          type="password"
          value={password}
          onChange={(event) =>
            setPassword(event.target.value)
          }
          placeholder="********"
          minLength={8}
          maxLength={128}
          required
        />

        <button
          type="submit"
          className="button button-primary button-full"
          disabled={submitting}
        >
          {submitting
            ? "Creating account..."
            : "Create Account"}
        </button>

        <p className="auth-footer">
          Already registered?{" "}
          <Link to="/login">Login</Link>
        </p>
      </form>
    </Page>
  );
}

/* =========================
   PLAYER DASHBOARD
========================= */

function Dashboard() {
  const { user } = useAuth();

  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await getMyStats();
        setStats(data.stats);
      } catch (err) {
        setError(err.message);
      }
    }

    loadStats();
  }, []);

  const totalChallenges = 45;
  const solvedChallenges = Number(stats?.solves || 0);
  const points = Number(stats?.points || 0);
  const rank = stats?.rank ? `#${stats.rank}` : "-";

  const completion = Math.min(
    100,
    Math.round((solvedChallenges / totalChallenges) * 100)
  );

  const easyChallenges = 10;
  const mediumChallenges = 10;
  const hardChallenges = 25;

  const difficultyTotal =
    easyChallenges + mediumChallenges + hardChallenges;

  const easyPercent = Math.round(
    (easyChallenges / difficultyTotal) * 100
  );

  const mediumPercent = Math.round(
    (mediumChallenges / difficultyTotal) * 100
  );

  const hardPercent = Math.round(
    (hardChallenges / difficultyTotal) * 100
  );

  return (
    <Page
      eyebrow="PLAYER DASHBOARD"
      title={`Welcome, ${user.username}`}
    >
      {error && (
        <div className="form-error">
          {error}
        </div>
      )}

      <div className="dashboard-grid dashboard-grid-modern">
        <div className="dashboard-stat dashboard-stat-primary">
          <span>POINTS</span>
          <strong>{points}</strong>
          <small>Competition score</small>
        </div>

        <div className="dashboard-stat">
          <span>SOLVES</span>
          <strong>{solvedChallenges}</strong>
          <small>Challenges completed</small>
        </div>

        <div className="dashboard-stat">
          <span>RANK</span>
          <strong>{rank}</strong>
          <small>Current leaderboard position</small>
        </div>

        <div className="dashboard-stat">
          <span>COMPLETION</span>
          <strong>{completion}%</strong>
          <small>{totalChallenges} total challenges</small>
        </div>
      </div>

      <div className="dashboard-main-grid">
        <section className="dashboard-panel dashboard-progress-panel">
          <div className="dashboard-panel-heading">
            <div>
              <span className="eyebrow">SEASON 01</span>
              <h2>Competition progress</h2>
            </div>

            <span className="dashboard-panel-label">
              {solvedChallenges} / {totalChallenges}
            </span>
          </div>

          <div className="dashboard-progress-layout">
            <div
              className="dashboard-ring"
              style={{
                "--progress": `${completion * 3.6}deg`,
              }}
            >
              <div className="dashboard-ring-inner">
                <strong>{completion}%</strong>
                <span>COMPLETE</span>
              </div>
            </div>

            <div className="dashboard-progress-copy">
              <h3>
                {solvedChallenges === 0
                  ? "Your competition starts here."
                  : solvedChallenges === totalChallenges
                    ? "Season 01 complete."
                    : "Keep building your score."}
              </h3>

              <p>
                Every solved challenge moves you closer to completing
                the Season 01 challenge set.
              </p>

              <div className="dashboard-progress-track">
                <div
                  className="dashboard-progress-fill"
                  style={{ width: `${completion}%` }}
                />
              </div>

              <div className="dashboard-progress-legend">
                <span>
                  <strong>{solvedChallenges}</strong> solved
                </span>

                <span>
                  <strong>
                    {Math.max(
                      totalChallenges - solvedChallenges,
                      0
                    )}
                  </strong>{" "}
                  remaining
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="dashboard-panel">
          <div className="dashboard-panel-heading">
            <div>
              <span className="eyebrow">DIFFICULTY</span>
              <h2>Season structure</h2>
            </div>
          </div>

          <div className="dashboard-donut-layout">
            <div
              className="dashboard-donut"
              style={{
                background: `conic-gradient(
                  #00e6a0 0deg ${easyPercent * 3.6}deg,
                  #168cff ${easyPercent * 3.6}deg ${(easyPercent + mediumPercent) * 3.6}deg,
                  #ff8a3d ${(easyPercent + mediumPercent) * 3.6}deg 360deg
                )`,
              }}
            >
              <div className="dashboard-donut-inner">
                <strong>{difficultyTotal}</strong>
                <span>CHALLENGES</span>
              </div>
            </div>

            <div className="dashboard-difficulty-list">
              <div>
                <span>
                  <i className="dashboard-dot easy-dot" />
                  Easy
                </span>
                <strong>{easyChallenges}</strong>
              </div>

              <div>
                <span>
                  <i className="dashboard-dot medium-dot" />
                  Medium
                </span>
                <strong>{mediumChallenges}</strong>
              </div>

              <div>
                <span>
                  <i className="dashboard-dot hard-dot" />
                  Hard
                </span>
                <strong>{hardChallenges}</strong>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="dashboard-panel dashboard-format-panel">
        <div className="dashboard-panel-heading">
          <div>
            <span className="eyebrow">FORMAT</span>
            <h2>Season 01 challenge distribution</h2>
          </div>

          <span className="dashboard-panel-label">
            45 TOTAL
          </span>
        </div>

        <div className="dashboard-bars">
          <div className="dashboard-bar-row">
            <div className="dashboard-bar-label">
              <span>DAY 01</span>
              <strong>15</strong>
            </div>

            <div className="dashboard-bar-track">
              <div
                className="dashboard-bar-fill"
                style={{ width: "100%" }}
              />
            </div>

            <span className="dashboard-bar-note">
              5 Easy / 5 Medium / 5 Hard
            </span>
          </div>

          <div className="dashboard-bar-row">
            <div className="dashboard-bar-label">
              <span>DAY 02</span>
              <strong>15</strong>
            </div>

            <div className="dashboard-bar-track">
              <div
                className="dashboard-bar-fill"
                style={{ width: "100%" }}
              />
            </div>

            <span className="dashboard-bar-note">
              5 Easy / 5 Medium / 5 Hard
            </span>
          </div>

          <div className="dashboard-bar-row">
            <div className="dashboard-bar-label">
              <span>DAY 03</span>
              <strong>15</strong>
            </div>

            <div className="dashboard-bar-track">
              <div
                className="dashboard-bar-fill dashboard-bar-fill-hard"
                style={{ width: "100%" }}
              />
            </div>

            <span className="dashboard-bar-note">
              15 Hard
            </span>
          </div>
        </div>
      </section>

      <section className="dashboard-action-card">
        <div>
          <span className="eyebrow">SEASON 01</span>

          <h2>
            Ready for the next challenge?
          </h2>

          <p>
            Explore the competition board, choose a challenge,
            and continue building your score.
          </p>
        </div>

        <div className="dashboard-action-buttons">
          <Link
            to="/events/season-01"
            className="button button-primary"
          >
            Explore Season 01
          </Link>

          <Link
            to="/leaderboard"
            className="button button-ghost"
          >
            View Leaderboard
          </Link>
        </div>
      </section>
    </Page>
  );
}

/* =========================
   ADMIN DASHBOARD
========================= */

function Admin() {
  return (
    <Page
      eyebrow="ADMINISTRATION"
      title="Admin Dashboard"
    >
      <div className="page-card">
        <span className="eyebrow">
          ADMIN ACCESS
        </span>

        <h2>Platform Management</h2>

        <p>
          Manage events and prepare the competition
          platform.
        </p>

        <div className="admin-grid">
          <Link
            to="/admin/events"
            className="day-card"
          >
            <span>EVENTS</span>
            <strong>Manage</strong>
          </Link>

          <Link
  to="/admin/challenges"
  className="day-card"
>
  <span>CHALLENGES</span>
  <strong>Manage</strong>
</Link>

          <div className="day-card">
            <span>USERS</span>
            <strong>Coming next</strong>
          </div>
        </div>
      </div>
    </Page>
  );
}

/* =========================
   ADMIN EVENTS
========================= */

function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    start_at: "",
    end_at: "",
    challenges_per_day_min: 10,
    challenges_per_day_max: 15,
  });

  async function loadEvents() {
    try {
      setLoading(true);
      setError("");

      const data = await getEvents();
      setEvents(data.events || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEvents();
  }, []);

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleCreate(event) {
    event.preventDefault();

    setError("");
    setCreating(true);

    try {
      await createEvent({
        name: form.name,
        slug: form.slug,
        description: form.description,
        start_at: new Date(form.start_at).toISOString(),
        end_at: new Date(form.end_at).toISOString(),
        challenges_per_day_min: Number(
          form.challenges_per_day_min
        ),
        challenges_per_day_max: Number(
          form.challenges_per_day_max
        ),
      });

      setForm({
        name: "",
        slug: "",
        description: "",
        start_at: "",
        end_at: "",
        challenges_per_day_min: 10,
        challenges_per_day_max: 15,
      });

      setShowForm(false);

      await loadEvents();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  }

  return (
    <Page
      eyebrow="ADMINISTRATION"
      title="Event Management"
    >
      <div className="admin-toolbar">
        <div>
          <span className="eyebrow">
            COMPETITIONS
          </span>

          <h2>Events</h2>
        </div>

        <button
          className="button button-primary"
          onClick={() => setShowForm((value) => !value)}
        >
          {showForm ? "Close" : "+ Create Event"}
        </button>
      </div>

      {error && (
        <div className="form-error">
          {error}
        </div>
      )}

      {showForm && (
        <form
          className="auth-card admin-form"
          onSubmit={handleCreate}
        >
          <h2>Create Event</h2>

          <label>Event Name</label>

          <input
            type="text"
            value={form.name}
            onChange={(event) =>
              updateField("name", event.target.value)
            }
            placeholder="NXTGENSEC Season 02"
            minLength={3}
            maxLength={120}
            required
          />

          <label>Slug</label>

          <input
            type="text"
            value={form.slug}
            onChange={(event) =>
              updateField(
                "slug",
                event.target.value.toLowerCase()
              )
            }
            placeholder="season-02"
            pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
            required
          />

          <label>Description</label>

          <textarea
            value={form.description}
            onChange={(event) =>
              updateField(
                "description",
                event.target.value
              )
            }
            placeholder="Competition description..."
            rows="5"
          />

          <label>Start</label>

          <input
            type="datetime-local"
            value={form.start_at}
            onChange={(event) =>
              updateField("start_at", event.target.value)
            }
            required
          />

          <label>End</label>

          <input
            type="datetime-local"
            value={form.end_at}
            onChange={(event) =>
              updateField("end_at", event.target.value)
            }
            required
          />

          <label>Minimum Challenges / Day</label>

          <input
            type="number"
            min="1"
            max="100"
            value={form.challenges_per_day_min}
            onChange={(event) =>
              updateField(
                "challenges_per_day_min",
                event.target.value
              )
            }
            required
          />

          <label>Maximum Challenges / Day</label>

          <input
            type="number"
            min="1"
            max="100"
            value={form.challenges_per_day_max}
            onChange={(event) =>
              updateField(
                "challenges_per_day_max",
                event.target.value
              )
            }
            required
          />

          <button
            type="submit"
            className="button button-primary button-full"
            disabled={creating}
          >
            {creating
              ? "Creating..."
              : "Create Event"}
          </button>
        </form>
      )}

      {loading ? (
        <div className="page-card">
          <p>Loading events...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="page-card">
          <p>No events found.</p>
        </div>
      ) : (
        <div className="admin-event-list">
          {events.map((event) => (
            <div
              className="admin-event-card"
              key={event.id}
            >
              <div>
                <span className="event-label">
                  {event.status}
                </span>

                <h3>{event.name}</h3>

                <p>
                  {event.description ||
                    "No description provided."}
                </p>
              </div>

              <div className="admin-event-details">
                <div>
                  <span>SLUG</span>
                  <strong>{event.slug}</strong>
                </div>

                <div>
                  <span>START</span>
                  <strong>
                    {new Date(
                      event.start_at
                    ).toLocaleString()}
                  </strong>
                </div>

                <div>
                  <span>END</span>
                  <strong>
                    {new Date(
                      event.end_at
                    ).toLocaleString()}
                  </strong>
                </div>

                <div>
                  <span>CHALLENGES / DAY</span>
                  <strong>
                    {event.challenges_per_day_min}-
                    {event.challenges_per_day_max}
                  </strong>
                </div>
              </div>

              <div className="admin-event-actions">
                <Link
                  to={`/admin/events/${event.id}/days`}
                  className="button button-primary"
                >
                  Manage Days
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </Page>
  );
}

/* =========================
   ADMIN CHALLENGES
========================= */

function AdminChallenges() {
  const [events, setEvents] = useState([]);
  const [days, setDays] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [createdDrafts, setCreatedDrafts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    event_id: "",
    event_day_id: "",
    title: "",
    slug: "",
    description: "",
    category: "WEB",
    difficulty: "BEGINNER",
    points: "100",
    flag: "",
    hint: "",
    author_name: "",
    release_at: "",
    archive_at: "",
    attachment_url: "",
    is_final: false,
    final_order: ""
  });

  async function loadEventData(eventId) {
    try {
      setError("");

      const [daysData, challengesData] = await Promise.all([
        getEventDays(eventId),
        getChallenges(eventId)
      ]);

      setDays(daysData.days || []);
      setChallenges(challengesData.challenges || []);
    } catch (err) {
      setError(
        err.message || "Failed to load challenge data."
      );
    }
  }

  async function loadInitialData() {
    try {
      setLoading(true);
      setError("");

      const eventsData = await getEvents();
      const nextEvents = eventsData.events || [];

      setEvents(nextEvents);

      if (nextEvents.length > 0) {
        const firstEventId = nextEvents[0].id;

        setForm((current) => ({
          ...current,
          event_id: firstEventId
        }));

        await loadEventData(firstEventId);
      }
    } catch (err) {
      setError(
        err.message || "Failed to load challenge management."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInitialData();
  }, []);

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value
    }));
  }

  async function handleEventChange(eventId) {
    setForm((current) => ({
      ...current,
      event_id: eventId,
      event_day_id: ""
    }));

    if (!eventId) {
      setDays([]);
      setChallenges([]);
      return;
    }

    await loadEventData(eventId);
  }

  async function handleCreate(event) {
    event.preventDefault();

    try {
      setCreating(true);
      setError("");
      setSuccess("");

      const result = await createChallenge({
        event_id: form.event_id,
        event_day_id: form.event_day_id || null,
        title: form.title,
        slug: form.slug.trim().toLowerCase(),
        description: form.description,
        category: form.category,
        difficulty: form.difficulty,
        points: Number(form.points),
        flag: form.flag,
        hint: form.hint || null,
        author_name: form.author_name || null,
        release_at: form.release_at
          ? new Date(form.release_at).toISOString()
          : null,
        archive_at: form.archive_at
          ? new Date(form.archive_at).toISOString()
          : null,
        is_final: form.is_final,
        final_order:
          form.is_final && form.final_order
            ? Number(form.final_order)
            : null,
        attachment_url: form.attachment_url || null
      });

      if (result.challenge) {
        setCreatedDrafts((current) => [
          result.challenge,
          ...current
        ]);
      }

      setSuccess(
        `Challenge "${result.challenge?.title || form.title}" created as DRAFT.`
      );

      setForm((current) => ({
        ...current,
        title: "",
        slug: "",
        description: "",
        points: "100",
        flag: "",
        hint: "",
        author_name: "",
        release_at: "",
        archive_at: "",
        attachment_url: "",
        is_final: false,
        final_order: ""
      }));

      setShowForm(false);
    } catch (err) {
      setError(
        err.message || "Failed to create challenge."
      );
    } finally {
      setCreating(false);
    }
  }

  async function handlePublish(challengeId) {
    try {
      setError("");
      setSuccess("");

      await publishChallenge(challengeId);

      setCreatedDrafts((current) =>
        current.filter((item) => item.id !== challengeId)
      );

      await loadEventData(form.event_id);

      setSuccess("Challenge published successfully.");
    } catch (err) {
      setError(
        err.message || "Failed to publish challenge."
      );
    }
  }

  async function handleArchive(challengeId) {
    try {
      setError("");
      setSuccess("");

      await archiveChallenge(challengeId);

      await loadEventData(form.event_id);

      setSuccess("Challenge archived successfully.");
    } catch (err) {
      setError(
        err.message || "Failed to archive challenge."
      );
    }
  }

  const visibleChallenges = [
    ...createdDrafts,
    ...challenges.filter(
      (challenge) =>
        !createdDrafts.some(
          (draft) => draft.id === challenge.id
        )
    )
  ];

  return (
    <Page
      eyebrow="ADMINISTRATION"
      title="Challenge Management"
    >
      <div className="admin-toolbar">
        <div>
          <span className="eyebrow">
            CTF CONTENT
          </span>

          <h2>Challenges</h2>

          <p>
            Create, publish, and archive NXTGENSEC challenges.
          </p>
        </div>

        <div className="admin-toolbar-actions">
          <Link
            to="/admin"
            className="button button-ghost"
          >
            <span>Back to Admin</span>
          </Link>

          <button
            type="button"
            className="button button-primary"
            onClick={() => {
              setShowForm((value) => !value);
              setError("");
              setSuccess("");
            }}
          >
            {showForm
              ? "Close"
              : "+ Create Challenge"}
          </button>
        </div>
      </div>

      {error && (
        <div className="form-error">
          {error}
        </div>
      )}

      {success && (
        <div className="form-success">
          {success}
        </div>
      )}

      {showForm && (
        <form
          className="auth-card admin-form"
          onSubmit={handleCreate}
        >
          <h2>Create Challenge</h2>

          <label>Event</label>

          <select
            value={form.event_id}
            onChange={(event) =>
              handleEventChange(
                event.target.value
              )
            }
            required
          >
            <option value="">
              Select event
            </option>

            {events.map((event) => (
              <option
                value={event.id}
                key={event.id}
              >
                {event.name}
              </option>
            ))}
          </select>

          <label>Event Day</label>

          <select
            value={form.event_day_id}
            onChange={(event) =>
              updateField(
                "event_day_id",
                event.target.value
              )
            }
            disabled={!form.event_id}
          >
            <option value="">
              No specific day
            </option>

            {days.map((day) => (
              <option
                value={day.id}
                key={day.id}
              >
                Day {day.day_number}
                {day.name
                  ? ` - ${day.name}`
                  : ""}
              </option>
            ))}
          </select>

          <label>Title</label>

          <input
            value={form.title}
            onChange={(event) =>
              updateField(
                "title",
                event.target.value
              )
            }
            minLength={3}
            maxLength={160}
            placeholder="Web Foundations"
            required
          />

          <label>Slug</label>

          <input
            value={form.slug}
            onChange={(event) =>
              updateField(
                "slug",
                event.target.value
                  .toLowerCase()
              )
            }
            pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
            placeholder="web-foundations"
            required
          />

          <label>Description</label>

          <textarea
            value={form.description}
            onChange={(event) =>
              updateField(
                "description",
                event.target.value
              )
            }
            rows="7"
            placeholder="Challenge description..."
            required
          />

          <label>Category</label>

          <select
            value={form.category}
            onChange={(event) =>
              updateField(
                "category",
                event.target.value
              )
            }
          >
            <option value="WEB">
              Web
            </option>

            <option value="CRYPTOGRAPHY">
              Cryptography
            </option>

            <option value="FORENSICS">
              Forensics
            </option>

            <option value="OSINT">
              OSINT
            </option>

            <option value="LINUX">
              Linux
            </option>

            <option value="NETWORKING">
              Networking
            </option>

            <option value="REVERSE_ENGINEERING">
              Reverse Engineering
            </option>

            <option value="MISCELLANEOUS">
              Miscellaneous
            </option>
          </select>

          <label>Difficulty</label>

          <select
            value={form.difficulty}
            onChange={(event) =>
              updateField(
                "difficulty",
                event.target.value
              )
            }
          >
            <option value="BEGINNER">
              Beginner
            </option>

            <option value="EASY">
              Easy
            </option>

            <option value="MEDIUM">
              Medium
            </option>

            <option value="HARD">
              Hard
            </option>

            <option value="EXPERT">
              Expert
            </option>
          </select>

          <label>Points</label>

          <input
            type="number"
            min="1"
            value={form.points}
            onChange={(event) =>
              updateField(
                "points",
                event.target.value
              )
            }
            required
          />

          <label>Flag</label>

          <input
            value={form.flag}
            onChange={(event) =>
              updateField(
                "flag",
                event.target.value
              )
            }
            placeholder="NXTGENSEC{...}"
            autoComplete="off"
            spellCheck="false"
            required
          />

          <label>Hint</label>

          <textarea
            value={form.hint}
            onChange={(event) =>
              updateField(
                "hint",
                event.target.value
              )
            }
            rows="4"
            placeholder="Optional hint..."
          />

          <label>Author</label>

          <input
            value={form.author_name}
            onChange={(event) =>
              updateField(
                "author_name",
                event.target.value
              )
            }
            maxLength={100}
            placeholder="NXTGENSEC Team"
          />

          <label>Release Time</label>

          <input
            type="datetime-local"
            value={form.release_at}
            onChange={(event) =>
              updateField(
                "release_at",
                event.target.value
              )
            }
          />

          <label>Archive Time</label>

          <input
            type="datetime-local"
            value={form.archive_at}
            onChange={(event) =>
              updateField(
                "archive_at",
                event.target.value
              )
            }
          />

          <label>Attachment URL</label>

          <input
            type="url"
            value={form.attachment_url}
            onChange={(event) =>
              updateField(
                "attachment_url",
                event.target.value
              )
            }
            placeholder="https://example.com/file.zip"
          />

          <label className="admin-checkbox">
            <input
              type="checkbox"
              checked={form.is_final}
              onChange={(event) =>
                updateField(
                  "is_final",
                  event.target.checked
                )
              }
            />

            Final challenge
          </label>

          {form.is_final && (
            <>
              <label>Final Order</label>

              <input
                type="number"
                min="1"
                max="4"
                value={form.final_order}
                onChange={(event) =>
                  updateField(
                    "final_order",
                    event.target.value
                  )
                }
                required
              />
            </>
          )}

          <button
            type="submit"
            className="button button-primary button-full"
            disabled={creating}
          >
            {creating
              ? "Creating..."
              : "Create Challenge"}
          </button>
        </form>
      )}

      {loading ? (
        <div className="page-card">
          <p>
            Loading challenge management...
          </p>
        </div>
      ) : visibleChallenges.length === 0 ? (
        <div className="page-card">
          <span className="eyebrow">
            CHALLENGES
          </span>

          <h2>No challenges yet.</h2>

          <p>
            Create your first Season 01 challenge
            using the button above.
          </p>
        </div>
      ) : (
        <div className="admin-event-list">
          {visibleChallenges.map((challenge) => {
            const isDraft =
              challenge.state === "DRAFT";

            return (
              <div
                className="admin-event-card"
                key={challenge.id}
              >
                <div>
                  <span className="event-label">
                    {challenge.state ||
                      "PUBLISHED"}
                  </span>

                  <h3>
                    {challenge.title}
                  </h3>

                  <p>
                    {challenge.description}
                  </p>
                </div>

                <div className="admin-event-details">
                  <div>
                    <span>CATEGORY</span>
                    <strong>
                      {challenge.category}
                    </strong>
                  </div>

                  <div>
                    <span>DIFFICULTY</span>
                    <strong>
                      {challenge.difficulty}
                    </strong>
                  </div>

                  <div>
                    <span>POINTS</span>
                    <strong>
                      {challenge.points}
                    </strong>
                  </div>

                  <div>
                    <span>SLUG</span>
                    <strong>
                      {challenge.slug}
                    </strong>
                  </div>
                </div>

                <div className="admin-event-actions">
                  {isDraft ? (
                    <button
                      type="button"
                      className="button button-primary"
                      onClick={() =>
                        handlePublish(
                          challenge.id
                        )
                      }
                    >
                      Publish
                    </button>
                  ) : (
                    <>
                      <Link
                        to={`/challenges/${encodeURIComponent(
                          challenge.slug
                        )}`}
                        className="button button-primary"
                      >
                        Open
                      </Link>

                      <button
                        type="button"
                        className="button button-ghost"
                        onClick={() =>
                          handleArchive(
                            challenge.id
                          )
                        }
                      >
                        Archive
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Page>
  );
}
/* =========================
   ADMIN EVENT DAYS
========================= */

function AdminEventDays() {
  const { eventId } = useParams();

  const [event, setEvent] = useState(null);
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    day_number: "",
    name: "",
    start_at: "",
    end_at: "",
  });

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [eventsData, daysData] = await Promise.all([
        getEvents(),
        getEventDays(eventId),
      ]);

      const foundEvent = (eventsData.events || []).find(
        (item) => item.id === eventId
      );

      setEvent(foundEvent || null);
      setDays(daysData.days || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [eventId]);

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleCreate(event) {
    event.preventDefault();

    setError("");
    setCreating(true);

    try {
      await createEventDay(eventId, {
        day_number: Number(form.day_number),
        name: form.name || undefined,
        start_at: new Date(
          form.start_at
        ).toISOString(),
        end_at: new Date(
          form.end_at
        ).toISOString(),
      });

      setForm({
        day_number: "",
        name: "",
        start_at: "",
        end_at: "",
      });

      setShowForm(false);

      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  }

  return (
    <Page
      eyebrow="ADMINISTRATION"
      title="Event Day Management"
    >
      <div className="admin-toolbar">
        <div>
          <span className="eyebrow">
            EVENT
          </span>

          <h2>
            {event
              ? event.name
              : "Loading event..."}
          </h2>

          <p>
            Configure the daily competition schedule.
          </p>
        </div>

        <div className="admin-toolbar-actions">
          <Link
            to="/admin/events"
            className="button button-ghost"
          >
            <span>Back to Events</span>
          </Link>

          <button
            className="button button-primary"
            onClick={() =>
              setShowForm((value) => !value)
            }
          >
            {showForm ? "Close" : "+ Add Day"}
          </button>
        </div>
      </div>

      {error && (
        <div className="form-error">
          {error}
        </div>
      )}

      {showForm && (
        <form
          className="auth-card admin-form"
          onSubmit={handleCreate}
        >
          <h2>Create Event Day</h2>

          <label>Day Number</label>

          <input
            type="number"
            min="1"
            max="31"
            value={form.day_number}
            onChange={(event) =>
              updateField(
                "day_number",
                event.target.value
              )
            }
            placeholder="1"
            required
          />

          <label>Day Name</label>

          <input
            type="text"
            value={form.name}
            onChange={(event) =>
              updateField(
                "name",
                event.target.value
              )
            }
            placeholder="Day 1 - Foundations"
            maxLength={120}
          />

          <label>Start</label>

          <input
            type="datetime-local"
            value={form.start_at}
            onChange={(event) =>
              updateField(
                "start_at",
                event.target.value
              )
            }
            required
          />

          <label>End</label>

          <input
            type="datetime-local"
            value={form.end_at}
            onChange={(event) =>
              updateField(
                "end_at",
                event.target.value
              )
            }
            required
          />

          <button
            type="submit"
            className="button button-primary button-full"
            disabled={creating}
          >
            {creating
              ? "Creating..."
              : "Create Day"}
          </button>
        </form>
      )}

      {loading ? (
        <div className="page-card">
          <p>Loading event days...</p>
        </div>
      ) : days.length === 0 ? (
        <div className="page-card">
          <p>
            No event days have been configured yet.
          </p>
        </div>
      ) : (
        <div className="admin-day-list">
          {days.map((day) => (
            <div
              className="admin-day-card"
              key={day.id}
            >
              <div className="admin-day-number">
                <span>DAY</span>
                <strong>
                  {String(day.day_number).padStart(2, "0")}
                </strong>
              </div>

              <div className="admin-day-details">
                <div>
                  <span>NAME</span>
                  <strong>
                    {day.name ||
                      `Day ${day.day_number}`}
                  </strong>
                </div>

                <div>
                  <span>START</span>
                  <strong>
                    {new Date(
                      day.start_at
                    ).toLocaleString()}
                  </strong>
                </div>

                <div>
                  <span>END</span>
                  <strong>
                    {new Date(
                      day.end_at
                    ).toLocaleString()}
                  </strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Page>
  );
}

/* =========================
   PAGE WRAPPER
========================= */

function Page({ eyebrow, title, children }) {
  return (
    <main className="page">
      <div className="page-heading">
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
      </div>

      {children}
    </main>
  );
}

/* =========================
   FOOTER
========================= */

function Footer() {
  return (
    <footer className="nxt-footer">
      <div className="nxt-footer-inner">

        <div className="nxt-footer-grid">

          <div className="nxt-footer-brand">
            <img
              src="/nxtgensec-logo.png"
              alt="NXTGENSEC"
              className="nxt-footer-logo"
            />

            <p>
              Cybersecurity education, hands-on challenges, and
              competitive security learning.
            </p>

            <a
              href="mailto:support@nxtgensec.org"
              className="nxt-footer-email"
            >
              <span>✉</span>
              <span>support@nxtgensec.org</span>
            </a>

            <div className="nxt-footer-socials">
              <a
                href="https://www.linkedin.com/company/nxtgensec"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="nxt-social-link"
              >
                <svg viewBox="0 0 24 24">
                  <path d="M6.5 8.4H3.3V21h3.2V8.4ZM4.9 3A1.9 1.9 0 1 0 4.9 6.8 1.9 1.9 0 0 0 4.9 3ZM21 13.7c0-3.8-2-5.6-4.7-5.6-2.2 0-3.2 1.2-3.8 2V8.4H9.3V21h3.2v-6.4c0-1.7.3-3.3 2.4-3.3 2 0 2 1.8 2 3.4V21H21v-7.3Z"/>
                </svg>
              </a>

              <a
                href="https://x.com/NxtgenSec"
                target="_blank"
                rel="noreferrer"
                aria-label="X"
                className="nxt-social-link"
              >
                <svg viewBox="0 0 24 24">
                  <path d="M18.9 2H22l-6.8 7.8L23 22h-6.1l-4.8-7.1L6 22H2.9l7.3-8.4L1 2h6.2l4.3 6.5L18.9 2Zm-1.1 17.5h1.7L6.3 4.4H4.5l13.3 15.1Z"/>
                </svg>
              </a>

              <a
                href="https://www.instagram.com/nxtgensec"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="nxt-social-link"
              >
                <svg viewBox="0 0 24 24">
                  <rect x="3" y="3" width="18" height="18" rx="5"/>
                  <circle cx="12" cy="12" r="4.2"/>
                  <circle cx="17.4" cy="6.7" r="1"/>
                </svg>
              </a>

              <a
                href="https://www.youtube.com/@NxtGenSec"
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                className="nxt-social-link"
              >
                <svg viewBox="0 0 24 24">
                  <path d="M21 7.2a2.8 2.8 0 0 0-2-2C17.2 4.7 12 4.7 12 4.7s-5.2 0-7 .5a2.8 2.8 0 0 0-2 2C2.5 9 2.5 12 2.5 12s0 3 .5 4.8a2.8 2.8 0 0 0 2 2c1.8.5 7 .5 7 .5s5.2 0 7-.5a2.8 2.8 0 0 0 2-2c.5-1.8.5-4.8.5-4.8s0-3-.5-4.8Z"/>
                  <path className="nxt-icon-cutout" d="m10.2 15.8 5.2-3.8-5.2-3.8v7.6Z"/>
                </svg>
              </a>

              <a
                href="https://t.me/nxtgensec"
                target="_blank"
                rel="noreferrer"
                aria-label="Telegram"
                className="nxt-social-link"
              >
                <svg viewBox="0 0 24 24">
                  <path d="M21.6 4.6 18.4 19c-.2 1-1 1.3-1.8.8l-4.7-3.5-2.3 2.2c-.3.3-.5.5-1 .5l.3-4.7 8.6-7.8c.4-.3-.1-.5-.6-.2L6.2 12.8 1.7 11.4c-1-.3-1-1 .2-1.4L20 3c.9-.3 1.8.2 1.6 1.6Z"/>
                </svg>
              </a>

              <a
                href="https://chat.whatsapp.com/ILzK1asY0ISK4XjpVShM6l"
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp Community"
                className="nxt-social-link"
              >
                <svg viewBox="0 0 24 24">
                  <path d="M12 3a9 9 0 0 0-7.7 13.7L3 21l4.5-1.2A9 9 0 1 0 12 3Z"/>
                  <path className="nxt-icon-cutout" d="M8.1 8.1c.2-.4.4-.4.7-.4h.5c.2 0 .4.1.5.4l.6 1.4c.1.2.1.4-.1.6l-.5.6c-.1.1-.1.3 0 .5.3.7 1.3 1.7 2 2 .2.1.4.1.5 0l.7-.6c.1-.1.3-.2.5-.1l1.4.7c.2.1.3.3.2.5-.2.7-.6 1.2-1.3 1.4-.6.2-1.4-.1-2.1-.4-1.2-.5-2.2-1.2-3.1-2.1-.8-.8-1.4-1.7-1.8-2.8-.3-.8-.5-1.5-.2-2.1Z"/>
                </svg>
              </a>

              <a
                href="https://github.com/nxtgensec"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                className="nxt-social-link"
              >
                <svg viewBox="0 0 24 24">
                  <path d="M12 2.8a9.3 9.3 0 0 0-2.9 18.1c.5.1.6-.2.6-.4v-1.6c-2.5.5-3-.6-3.2-1.2-.1-.3-.6-1.2-1-1.5-.3-.2-.8-.5 0-.5.8 0 1.3.8 1.5 1.1.9 1.5 2.4 1.1 3 .8.1-.7.4-1.1.7-1.3-2.2-.2-4.5-1.1-4.5-4.8 0-1.1.4-2 1-2.7-.1-.2-.5-1.3.1-2.6 0 0 .8-.3 2.8 1a9.8 9.8 0 0 1 5.1 0c2-1.3 2.8-1 2.8-1 .6 1.3.2 2.4.1 2.6.6.7 1 1.6 1 2.7 0 3.7-2.3 4.6-4.5 4.8.4.3.7.8.7 1.6v2.4c0 .2.2.5.6.4A9.3 9.3 0 0 0 12 2.8Z"/>
                </svg>
              </a>

              <a
                href="https://nxtgensec.org/"
                target="_blank"
                rel="noreferrer"
                aria-label="Website"
                className="nxt-social-link"
              >
                <svg viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="9"/>
                  <path d="M3.5 12h17M12 3c2.1 2.5 3.2 5.5 3.2 9S14.1 18.5 12 21c-2.1-2.5-3.2-5.5-3.2-9S9.9 5.5 12 3Z"/>
                </svg>
              </a>
            </div>
          </div>

          <div className="nxt-footer-column">
            <h3>NAVIGATION</h3>
            <Link to="/">Home</Link>
            <Link to="/events">Events</Link>
            <Link to="/events/season-01">Season 01</Link>
            <Link to="/leaderboard">Leaderboard</Link>
            <Link to="/about">About</Link>
          </div>

          <div className="nxt-footer-column">
            <h3>PLATFORM</h3>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/login">Login</Link>
            <Link to="/register">Join CTF</Link>
            <span>Challenge Labs</span>
            <span>Competition Scoring</span>
          </div>

          <div className="nxt-footer-column">
            <h3>TRACKS</h3>
            <span>Web Security</span>
            <span>Cryptography</span>
            <span>Forensics</span>
            <span>OSINT</span>
            <span>Linux</span>
            <span>Networking</span>
            <span>Reverse Engineering</span>
            <span>Miscellaneous</span>
          </div>

        </div>

        <div className="nxt-footer-bottom">
          <span className="nxt-footer-status">PLATFORM ONLINE</span>
          <span>© 2026 NXTGENSEC. All rights reserved.</span>
        </div>

      </div>
    </footer>
  );
}

function ChallengeDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [flag, setFlag] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const [submitError, setSubmitError] = useState("");
  const [challengeSolved, setChallengeSolved] = useState(false);
  const [solvedPoints, setSolvedPoints] = useState(0);
  const [statusLoading, setStatusLoading] = useState(false);
  const [artifact, setArtifact] = useState(null);
  useEffect(() => {
    async function loadChallengeArtifact() {
      if (!challenge) {
        return;
      }

      try {
        const data = await getChallengeArtifact(challenge.id);
        setArtifact(data.artifact || null);
      } catch {
        setArtifact(null);
      }
    }

    loadChallengeArtifact();
  }, [challenge]);
  useEffect(() => {
    async function loadChallenge() {
      try {
        setLoading(true);
        setError("");
        setSubmitResult(null);
        setSubmitError("");
        setFlag("");
        setChallengeSolved(false);
        setSolvedPoints(0);

        const data = await getChallengeBySlug(slug);

        if (!data.challenge) {
          throw new Error("Challenge was not found.");
        }

        setChallenge(data.challenge);
      } catch (err) {
        setError(err.message || "Failed to load challenge.");
      } finally {
        setLoading(false);
      }
    }

    loadChallenge();
  }, [slug]);

  useEffect(() => {
    async function loadChallengeStatus() {
      if (!challenge || !user) {
        return;
      }

      try {
        setStatusLoading(true);

        const status = await getChallengeStatus(challenge.id);

        if (status.solved) {
          setChallengeSolved(true);
          setSolvedPoints(Number(status.points_awarded) || 0);

          setSubmitResult({
            type: "already_solved",
            message: "Challenge already solved.",
            pointsAwarded: Number(status.points_awarded) || 0,
          });
        } else {
          setChallengeSolved(false);
          setSolvedPoints(0);
        }
      } catch {
        /*
         * If the status check fails, keep the normal submission UI.
         * The actual flag submission remains protected by the backend.
         */
      } finally {
        setStatusLoading(false);
      }
    }

    loadChallengeStatus();
  }, [challenge, user]);

  async function handleFlagSubmit(event) {
    event.preventDefault();

    if (!user) {
      navigate("/login");
      return;
    }

    const trimmedFlag = flag.trim();

    if (
      !trimmedFlag ||
      submitting ||
      statusLoading ||
      !challenge ||
      challengeSolved
    ) {
      return;
    }

    try {
      setSubmitting(true);
      setSubmitResult(null);
      setSubmitError("");

      const result = await submitFlag(
        challenge.id,
        trimmedFlag
      );

      if (result.correct && result.already_solved) {
        const awardedPoints =
          Number(result.points_awarded) || 0;

        setChallengeSolved(true);
        setSolvedPoints(awardedPoints);

        setSubmitResult({
          type: "already_solved",
          message:
            result.message || "Challenge already solved.",
          pointsAwarded: awardedPoints,
        });

        setFlag("");
        return;
      }

      if (result.correct) {
        const awardedPoints =
          Number(result.points_awarded) || 0;

        setChallengeSolved(true);
        setSolvedPoints(awardedPoints);

        setSubmitResult({
          type: "correct",
          message: result.message || "Correct flag",
          pointsAwarded: awardedPoints,
        });

        setFlag("");
        return;
      }

      setSubmitResult({
        type: "incorrect",
        message: result.message || "Incorrect flag",
        pointsAwarded: 0,
      });
    } catch (err) {
      setSubmitError(
        err.message ||
          "Failed to submit flag. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <Page eyebrow="CHALLENGE" title="Loading...">
        <div className="page-card">
          <p>Loading challenge data...</p>
        </div>
      </Page>
    );
  }

  if (error || !challenge) {
    return (
      <Page
        eyebrow="CHALLENGE"
        title="Challenge unavailable"
      >
        <div className="page-card">
          <div className="form-error">
            {error || "Challenge was not found."}
          </div>

          <button
            type="button"
            className="button button-secondary"
            onClick={() =>
              navigate("/events/season-01")
            }
          >
            <span>Back to Season 01</span>
          </button>
        </div>
      </Page>
    );
  }

  return (
    <Page
      eyebrow={`${challenge.category} - ${challenge.difficulty}`}
      title={challenge.title}
    >
      <div className="page-card">
        <div className="challenge-detail-meta">
          <span className="status-badge">
            {challenge.category}
          </span>

          <span className="status-badge">
            {challenge.difficulty}
          </span>

          <span className="status-badge">
            {challenge.points} POINTS
          </span>

          {challenge.is_final && (
            <span className="status-badge">FINAL</span>
          )}
        </div>

        <div className="challenge-detail-description">
          <h2>Challenge Brief</h2>
          <p>{challenge.description}</p>
        </div>

        {artifact && (
          <div className="challenge-artifact">
            <span className="eyebrow">TRAINING ARTIFACT</span>

            <h2>{artifact.title}</h2>

            <p>{artifact.message}</p>

            {artifact.image && (
              <div className="artifact-image-wrap">
                <img
                  src={artifact.image}
                  alt={artifact.title}
                  className="artifact-image"
                />
              </div>
            )}

            {artifact.type === "html-metadata" && artifact.html && (
              <div className="artifact-code">
                <pre>
                  <code>{artifact.html}</code>
                </pre>
              </div>
            )}

            {!artifact.image &&
              artifact.type !== "html-metadata" &&
              artifact.value && (
                <div className="artifact-code">
                  <pre>
                    <code>{artifact.value}</code>
                  </pre>
                </div>
              )}

            {!artifact.image && artifact.text && (
              <div className="artifact-code">
                <pre>
                  <code>{artifact.text}</code>
                </pre>
              </div>
            )}

            {artifact.clue && (
              <div className="challenge-hint">
                <span className="eyebrow">CLUE</span>
                <p>{artifact.clue}</p>
              </div>
            )}
          </div>
        )}

        {challenge.hint && (
          <div className="challenge-hint">
            <span className="eyebrow">HINT</span>
            <p>{challenge.hint}</p>
          </div>
        )}

        {challenge.attachment_url && (
          <div className="challenge-attachment">
            <span className="eyebrow">ATTACHMENT</span>

            <p>
              Open the challenge attachment in a new tab.
            </p>

            <a
              href={challenge.attachment_url}
              target="_blank"
              rel="noreferrer"
              className="button button-ghost"
            >
              Open Attachment
            </a>
          </div>
        )}

        <div className="challenge-submit">
          <div className="challenge-submit-heading">
            <span className="eyebrow">
              FLAG SUBMISSION
            </span>

            <h2>
              {challengeSolved
                ? "Challenge completed"
                : "Submit your flag"}
            </h2>

            <p>
              {challengeSolved
                ? "This challenge has already been submitted."
                : "Enter the flag you discovered for this challenge."}
            </p>
          </div>

          {!user ? (
            <div className="form-error">
              You must be logged in to submit a flag.

              <div style={{ marginTop: "12px" }}>
                <button
                  type="button"
                  className="button button-primary"
                  onClick={() => navigate("/login")}
                >
                  Login to Submit
                </button>
              </div>
            </div>
          ) : statusLoading ? (
            <div className="submission-info" role="status">
              <strong>Checking submission status...</strong>
              <span>
                Checking whether you have already solved
                this challenge.
              </span>
            </div>
          ) : challengeSolved ? (
            <div className="submission-success" role="status">
              <strong>OK SUBMITTED</strong>

              <span>
                Challenge completed - Points awarded: +
                {solvedPoints}
              </span>
            </div>
          ) : (
            <form
              onSubmit={handleFlagSubmit}
              className="flag-form"
              noValidate
            >
              <label htmlFor="challenge-flag">
                FLAG
              </label>

              <input
                id="challenge-flag"
                name="flag"
                type="text"
                value={flag}
                onChange={(event) => {
                  setFlag(event.target.value);
                  setSubmitResult(null);
                  setSubmitError("");
                }}
                placeholder="NXTGENSEC{...}"
                autoComplete="off"
                spellCheck="false"
                disabled={submitting}
                aria-label="Challenge flag"
                required
              />

              <button
                type="submit"
                className="button button-primary"
                disabled={
                  submitting ||
                  statusLoading ||
                  !flag.trim()
                }
              >
                {submitting
                  ? "Submitting..."
                  : "Submit Flag"}
              </button>
            </form>
          )}

          {!challengeSolved &&
            submitResult?.type === "incorrect" && (
              <div
                className="submission-error"
                role="alert"
              >
                <strong>X Incorrect flag</strong>
                <span>{submitResult.message}</span>
              </div>
            )}

          {submitError && (
            <div
              className="submission-error"
              role="alert"
            >
              <strong>Submission error</strong>
              <span>{submitError}</span>
            </div>
          )}
        </div>

        <button
          type="button"
          className="button button-secondary"
          onClick={() => navigate("/events/season-01")}
        >
          <span>Back to Season 01</span>
        </button>
      </div>
    </Page>
  );
}
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="app-shell">
          <Navbar />

          <main className="main-content">
            <Routes>
              <Route
                path="/"
                element={<Home />}
              />

              <Route
                path="/events"
                element={<Events />}
              />

              <Route
                path="/events/season-01"
                element={<SeasonOne />}
              />

              <Route
                path="/challenges/:slug"
                element={<ChallengeDetail />}
              />

              <Route
                path="/leaderboard"
                element={<Leaderboard />}
              />

              <Route
                path="/about"
                element={<About />}
              />

              <Route
                path="/login"
                element={<Login />}
              />

              <Route
                path="/register"
                element={<Register />}
              />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <Admin />
                  </AdminRoute>
                }
              />

              <Route
                path="/admin/events"
                element={
                  <AdminRoute>
                    <AdminEvents />
                  </AdminRoute>
                }
              />

              <Route
                path="/admin/challenges"
                element={
                  <AdminRoute>
                    <AdminChallenges />
                  </AdminRoute>
                }
              />

              <Route
                path="/admin/events/:eventId/days"
                element={
                  <AdminRoute>
                    <AdminEventDays />
                  </AdminRoute>
                }
              />

              <Route
                path="*"
                element={<Navigate to="/" replace />}
              />
            </Routes>
          </main>

          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;







