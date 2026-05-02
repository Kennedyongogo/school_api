/**
 * Audit logging stub — legacy delivery AuditTrail model removed with school schema.
 * Replace with persistent audit storage when needed.
 */

const noop = async () => null;

const getIpAddress = (req) =>
  req.headers["x-forwarded-for"]?.split(",")[0] ||
  req.connection?.remoteAddress ||
  req.socket?.remoteAddress ||
  req.ip ||
  "unknown";

const getUserAgent = (req) => req.headers["user-agent"] || "unknown";

const getRequestMetadata = (req) => ({
  ip_address: getIpAddress(req),
  user_agent: getUserAgent(req),
  user_id: req.user?.id || null,
});

module.exports = {
  logAudit: noop,
  getIpAddress,
  getUserAgent,
  getRequestMetadata,
  logLogin: noop,
  logLogout: noop,
  logCreate: noop,
  logUpdate: noop,
  logDelete: noop,
  logStatusChange: noop,
  logUpload: noop,
  logDownload: noop,
};
