const TZ_OFFSETS = {
  "Africa/Nairobi": "+03:00",
  "Africa/Kampala": "+03:00",
  "Africa/Addis_Ababa": "+03:00",
  "Africa/Dar_es_Salaam": "+03:00",
};

function appendOffsetIfNaive(value, timezone = "Africa/Nairobi") {
  const trimmed = String(value || "").trim();
  if (!trimmed) return trimmed;
  if (/[zZ]$/.test(trimmed) || /[+-]\d{2}:\d{2}$/.test(trimmed)) return trimmed;
  const offset = TZ_OFFSETS[timezone] || TZ_OFFSETS["Africa/Nairobi"];
  if (!trimmed.includes("T")) return trimmed;
  return `${trimmed}${offset}`;
}

/** Interpret admin wall-clock date/time in the exam timezone and return a UTC Date for storage. */
function normalizeWallClockToDate(value, timezone = "Africa/Nairobi") {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  const withOffset = appendOffsetIfNaive(value, timezone);
  const parsed = new Date(withOffset);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

module.exports = {
  TZ_OFFSETS,
  appendOffsetIfNaive,
  normalizeWallClockToDate,
};
