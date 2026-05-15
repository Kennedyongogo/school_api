/**
 * Whether a student may join an online live class for a timetable slot.
 * Staff bypass this check at the controller layer.
 */

const EARLY_JOIN_MINUTES = 15;

function parseClockOnDate(dateOnly, timeValue) {
  if (!dateOnly) return null;
  const dateStr = String(dateOnly).slice(0, 10);
  const timeStr = timeValue != null && String(timeValue).trim() !== "" ? String(timeValue).slice(0, 8) : "00:00:00";
  const d = new Date(`${dateStr}T${timeStr}`);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * @returns {{ can_join: boolean, reason: string|null, opens_at: string|null, closes_at: string|null }}
 */
function getLessonJoinWindow({
  lesson_date,
  starts_at,
  ends_at,
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
      reason: "This class session has ended.",
      opens_at: null,
      closes_at: null,
    };
  }

  const slotStart = parseClockOnDate(lesson_date, starts_at);
  const slotEnd = parseClockOnDate(lesson_date, ends_at || starts_at);

  if (!slotStart || !slotEnd) {
    return { can_join: true, reason: null, opens_at: null, closes_at: null };
  }

  let end = slotEnd;
  if (end.getTime() <= slotStart.getTime()) {
    end = new Date(slotStart.getTime() + 60 * 60 * 1000);
  }

  const opensAt = new Date(slotStart.getTime() - early_minutes * 60 * 1000);
  const now = new Date();

  if (now < opensAt) {
    return {
      can_join: false,
      reason: "This class is not open yet. You can join shortly before the scheduled start time.",
      opens_at: opensAt.toISOString(),
      closes_at: end.toISOString(),
    };
  }

  if (now > end) {
    return {
      can_join: false,
      reason: "This class time has passed. The join button is no longer available.",
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

function assertStudentCanJoinLessonWindow(params) {
  const win = getLessonJoinWindow({ ...params, is_staff: false });
  if (!win.can_join) {
    const err = new Error(win.reason || "This class is not open for joining.");
    err.statusCode = 403;
    throw err;
  }
  return win;
}

module.exports = {
  EARLY_JOIN_MINUTES,
  getLessonJoinWindow,
  assertStudentCanJoinLessonWindow,
};
