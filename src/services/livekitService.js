const { AccessToken, RoomServiceClient } = require("livekit-server-sdk");
const { PUBLIC_PORTAL_ALLOWED_ROLES } = require("../constants/userRoles");

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

/** HTTP base URL for RoomServiceClient (not WebSocket). */
function getLiveKitApiUrl() {
  let url = getLiveKitUrl();
  if (!url) return "";
  if (url.startsWith("wss://")) return url.replace("wss://", "https://");
  if (url.startsWith("ws://")) return url.replace("ws://", "http://");
  if (!url.startsWith("http")) return `https://${url}`;
  return url;
}

function getRoomServiceClient() {
  const host = getLiveKitApiUrl();
  if (!host || !process.env.LIVEKIT_API_KEY || !process.env.LIVEKIT_API_SECRET) {
    return null;
  }
  return new RoomServiceClient(host, process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET);
}

/**
 * Disconnect parents/students from a LiveKit room (staff remain connected).
 * @returns {Promise<{ removed: number }>}
 */
async function removePublicParticipantsFromRoom(roomName) {
  if (!isConfigured() || !roomName) return { removed: 0 };

  const client = getRoomServiceClient();
  if (!client) return { removed: 0 };

  const { User } = require("../models");
  let participants = [];
  try {
    participants = await client.listParticipants(String(roomName));
  } catch (err) {
    if (/not found|404|does not exist/i.test(String(err?.message || err))) {
      return { removed: 0 };
    }
    throw err;
  }

  let removed = 0;
  for (const participant of participants) {
    const identity = participant?.identity;
    if (!identity) continue;
    const user = await User.findByPk(identity, { attributes: ["id", "role"] });
    if (!user || !PUBLIC_PORTAL_ALLOWED_ROLES.includes(user.role)) continue;
    try {
      await client.removeParticipant(String(roomName), String(identity));
      removed += 1;
    } catch (_) {
      /* participant may have already left */
    }
  }
  return { removed };
}

module.exports = {
  getLiveKitUrl,
  getLiveKitApiUrl,
  isConfigured,
  createParticipantToken,
  removePublicParticipantsFromRoom,
};
