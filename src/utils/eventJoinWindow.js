const EARLY_JOIN_MINUTES = 15;

/**
 * @returns {{ can_join: boolean, reason: string|null, opens_at: string|null, closes_at: string|null }}
 */
function getEventJoinWindow({
  start_date,
  end_date,
  session_status,
  is_staff = false,
  early_minutes = EARLY_JOIN_MINUTES,
}) {
  if (is_staff) {
    return { can_join: true, reason: null, opens_at: null, closes_at: null };
  }

  if (session_status === "ended" || session_status === "cancelled") {
    return {
      can_join: false,
      reason: "This event has ended.",
      opens_at: null,
      closes_at: null,
    };
  }

  const start = start_date ? new Date(start_date) : null;
  let end = end_date ? new Date(end_date) : null;

  if (!start || Number.isNaN(start.getTime())) {
    return { can_join: true, reason: null, opens_at: null, closes_at: null };
  }

  if (!end || Number.isNaN(end.getTime()) || end.getTime() <= start.getTime()) {
    end = new Date(start.getTime() + 60 * 60 * 1000);
  }

  const opensAt = new Date(start.getTime() - early_minutes * 60 * 1000);
  const now = new Date();

  if (now < opensAt) {
    return {
      can_join: false,
      reason: "This event is not open yet. You can join shortly before the start time.",
      opens_at: opensAt.toISOString(),
      closes_at: end.toISOString(),
    };
  }

  if (now > end) {
    return {
      can_join: false,
      reason: "This event has ended. The join option is no longer available.",
      opens_at: opensAt.toISOString(),
      closes_at: end.toISOString(),
    };
  }

  return {
    can_join: true,
    reason: null,
    opens_at: opensAt.toISOString(),
    closes_at: end.toISOString(),
  };
}

function assertPortalCanJoinEventWindow(params) {
  const win = getEventJoinWindow({ ...params, is_staff: false });
  if (!win.can_join) {
    const err = new Error(win.reason || "This event is not open for joining.");
    err.statusCode = 403;
    throw err;
  }
  return win;
}

module.exports = {
  EARLY_JOIN_MINUTES,
  getEventJoinWindow,
  assertPortalCanJoinEventWindow,
};
