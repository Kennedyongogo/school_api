const TZ_OFFSETS = {
  "Africa/Nairobi": "+03:00",
  "Africa/Kampala": "+03:00",
  "Africa/Addis_Ababa": "+03:00",
  "Africa/Dar_es_Salaam": "+03:00",
};

const DEFAULT_SCHEDULE_TIMEZONE = "Africa/Nairobi";

function normalizeTimeToHms(timeValue) {
  if (timeValue == null || String(timeValue).trim() === "") return "00:00:00";
  let s = String(timeValue).trim();
  if (s.length === 5) s = `${s}:00`;
  return s.slice(0, 8);
}

function appendOffsetIfNaive(value, timezone = DEFAULT_SCHEDULE_TIMEZONE) {
  const trimmed = String(value || "").trim();
  if (!trimmed) return trimmed;
  if (/[zZ]$/.test(trimmed) || /[+-]\d{2}:\d{2}$/.test(trimmed)) return trimmed;
  const offset = TZ_OFFSETS[timezone] || TZ_OFFSETS["Africa/Nairobi"];
  if (!trimmed.includes("T")) return trimmed;
  return `${trimmed}${offset}`;
}

/** Interpret admin wall-clock date/time in the exam timezone and return a UTC Date for storage. */
function normalizeWallClockToDate(value, timezone = DEFAULT_SCHEDULE_TIMEZONE) {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  const withOffset = appendOffsetIfNaive(value, timezone);
  const parsed = new Date(withOffset);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/** Combine lesson date + clock time as wall-clock in the school timezone → UTC Date for comparisons. */
function lessonSlotToDate(lessonDate, timeValue, timezone = DEFAULT_SCHEDULE_TIMEZONE) {
  if (!lessonDate) return null;
  const dateStr = String(lessonDate).slice(0, 10);
  const timeStr = normalizeTimeToHms(timeValue);
  return normalizeWallClockToDate(`${dateStr}T${timeStr}`, timezone);
}

module.exports = {
  DEFAULT_SCHEDULE_TIMEZONE,
  TZ_OFFSETS,
  normalizeTimeToHms,
  appendOffsetIfNaive,
  normalizeWallClockToDate,
  lessonSlotToDate,
};
