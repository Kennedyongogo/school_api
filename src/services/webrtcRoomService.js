const crypto = require("crypto");

function portalBaseUrl() {
  return (
    process.env.SCHOOL_PORTAL_PUBLIC_URL ||
    process.env.PUBLIC_PORTAL_URL ||
    "http://localhost:3004"
  )
    .trim()
    .replace(/\/$/, "");
}

function adminBaseUrl() {
  return (process.env.SCHOOL_ADMIN_PUBLIC_URL || "http://localhost:3000").trim().replace(/\/$/, "");
}

function buildMeetingId(lessonId) {
  const salt = `${lessonId}:${Date.now()}:${crypto.randomBytes(6).toString("hex")}`;
  const hash = crypto.createHash("sha256").update(salt).digest("hex").slice(0, 16);
  return `lc-${hash}`;
}

function portalLiveClassUrl(liveClassId) {
  return `${portalBaseUrl()}/portal/live-class/${liveClassId}`;
}

function adminLiveClassUrl(liveClassId) {
  return `${adminBaseUrl()}/live-class/${liveClassId}`;
}

function portalLiveClassPath(liveClassId) {
  return `/portal/live-class/${liveClassId}`;
}

function adminLiveClassPath(liveClassId) {
  return `/live-class/${liveClassId}`;
}

/**
 * Provision WebRTC room metadata for a new live_classes row (URLs set after row id exists).
 */
function provisionForLesson(lessonId, platform = "webrtc") {
  const meeting_id = buildMeetingId(lessonId);
  const p = String(platform || "webrtc").trim().toLowerCase();
  return {
    meeting_id,
    platform: p === "livekit" ? "livekit" : "webrtc",
    join_url: "",
    host_url: "",
  };
}

function urlsForLiveClassRow(liveClassId) {
  return {
    join_url: portalLiveClassUrl(liveClassId),
    host_url: adminLiveClassUrl(liveClassId),
    join_path: portalLiveClassPath(liveClassId),
    host_path: adminLiveClassPath(liveClassId),
  };
}

function getIceServers() {
  const servers = [{ urls: "stun:stun.l.google.com:19302" }];
  const turnUrl = process.env.WEBRTC_TURN_URL ? String(process.env.WEBRTC_TURN_URL).trim() : "";
  const turnUser = process.env.WEBRTC_TURN_USERNAME ? String(process.env.WEBRTC_TURN_USERNAME).trim() : "";
  const turnCred = process.env.WEBRTC_TURN_CREDENTIAL ? String(process.env.WEBRTC_TURN_CREDENTIAL).trim() : "";
  if (turnUrl && turnUser && turnCred) {
    servers.push({ urls: turnUrl, username: turnUser, credential: turnCred });
  }
  return servers;
}

function socketRoomName(meetingId) {
  return `webrtc:${String(meetingId || "").trim()}`;
}

module.exports = {
  buildMeetingId,
  provisionForLesson,
  urlsForLiveClassRow,
  portalLiveClassUrl,
  adminLiveClassUrl,
  portalLiveClassPath,
  adminLiveClassPath,
  getIceServers,
  socketRoomName,
  portalBaseUrl,
  adminBaseUrl,
};
