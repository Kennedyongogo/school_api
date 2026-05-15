const { AccessToken } = require("livekit-server-sdk");

function getLiveKitUrl() {
  return (
    process.env.LIVEKIT_URL ||
    process.env.LIVEKIT_WS_URL ||
    ""
  )
    .trim()
    .replace(/\/$/, "");
}

function isConfigured() {
  return !!(getLiveKitUrl() && process.env.LIVEKIT_API_KEY && process.env.LIVEKIT_API_SECRET);
}

/**
 * @param {{ roomName: string, identity: string, name?: string, role?: 'teacher'|'student'|'host' }}
 */
async function createParticipantToken({ roomName, identity, name, role = "student" }) {
  if (!isConfigured()) {
    const err = new Error("LiveKit is not configured. Set LIVEKIT_URL, LIVEKIT_API_KEY, and LIVEKIT_API_SECRET.");
    err.statusCode = 503;
    throw err;
  }
  if (!roomName) {
    const err = new Error("roomName is required");
    err.statusCode = 400;
    throw err;
  }

  const isHost = role === "teacher" || role === "host";
  const at = new AccessToken(process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET, {
    identity: String(identity),
    name: name ? String(name) : String(identity),
    ttl: 4 * 60 * 60,
  });

  at.addGrant({
    roomJoin: true,
    room: String(roomName),
    canSubscribe: true,
    canPublish: true,
    canPublishData: false,
    ...(isHost ? { roomAdmin: true, canUpdateOwnMetadata: true } : {}),
  });

  const token = await at.toJwt();
  return { token, url: getLiveKitUrl() };
}

module.exports = {
  getLiveKitUrl,
  isConfigured,
  createParticipantToken,
};
