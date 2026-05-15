/** In-app video (not external Zoom/Meet/Jitsi links). */
function isInAppVideoPlatform(platform) {
  const p = platform == null ? "" : String(platform).trim().toLowerCase();
  return p === "webrtc" || p === "livekit";
}

function defaultOnlineMeetingMode() {
  return String(process.env.ONLINE_MEETING_PLATFORM || "livekit").trim().toLowerCase();
}

module.exports = { isInAppVideoPlatform, defaultOnlineMeetingMode };
