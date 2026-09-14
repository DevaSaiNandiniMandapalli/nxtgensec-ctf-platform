const API_BASE_URL = "https://nxtgensec-api.onrender.com/api";
async function apiRequest(path, options = {}) {
  const token = localStorage.getItem("nxtgensec_token");

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  let data = {};

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    const error = new Error(data.error || "Request failed");
    error.status = response.status;
    error.details = data.details;
    throw error;
  }

  return data;
}

/* =========================
   AUTH
========================= */

export async function registerUser({ username, email, password }) {
  return apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify({ username, email, password }),
  });
}

export async function loginUser({ email, password }) {
  return apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function getCurrentUser() {
  return apiRequest("/auth/me");
}

export async function getMyStats() {
  return apiRequest("/auth/stats");
}

/* =========================
   EVENTS
========================= */

export async function getEvents() {
  return apiRequest("/events");
}

export async function getEventBySlug(slug) {
  return apiRequest(`/events/${encodeURIComponent(slug)}`);
}

export async function createEvent(eventData) {
  return apiRequest("/events", {
    method: "POST",
    body: JSON.stringify(eventData),
  });
}

/* =========================
   EVENT DAYS
========================= */

export async function getEventDays(eventId) {
  return apiRequest(`/events/${eventId}/days`);
}

export async function createEventDay(eventId, dayData) {
  return apiRequest(`/events/${eventId}/days`, {
    method: "POST",
    body: JSON.stringify(dayData),
  });
}

/* =========================
   CHALLENGES
========================= */

export async function getChallenges(eventId) {
  return apiRequest(`/challenges/event/${eventId}`);
}

export async function getChallengeBySlug(slug) {
  return apiRequest(`/challenges/${encodeURIComponent(slug)}`);
}

export async function getChallengeStatus(challengeId) {
  return apiRequest(`/challenges/${challengeId}/status`);
}

export async function getChallengeArtifact(challengeId) {
  return apiRequest(`/challenges/${challengeId}/artifact`);
}

export async function createChallenge(challengeData) {
  return apiRequest("/challenges", {
    method: "POST",
    body: JSON.stringify(challengeData),
  });
}

export async function publishChallenge(challengeId) {
  return apiRequest(`/challenges/${challengeId}/publish`, {
    method: "POST",
  });
}

export async function archiveChallenge(challengeId) {
  return apiRequest(`/challenges/${challengeId}/archive`, {
    method: "POST",
  });
}

/* =========================
   SUBMISSIONS
========================= */

export async function submitFlag(challengeId, flag) {
  return apiRequest(`/challenges/${challengeId}/submit`, {
    method: "POST",
    body: JSON.stringify({ flag }),
  });
}

/* =========================
   LEADERBOARD
========================= */

export async function getLeaderboard(eventId) {
  return apiRequest(`/events/${eventId}/leaderboard`);
}

/* =========================
   TOKEN MANAGEMENT
========================= */

export function saveToken(token) {
  localStorage.setItem("nxtgensec_token", token);
}

export function removeToken() {
  localStorage.removeItem("nxtgensec_token");
}

export function getToken() {
  return localStorage.getItem("nxtgensec_token");
}
