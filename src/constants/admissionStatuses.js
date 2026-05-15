/** Allowed admission application workflow statuses. */
exports.ADMISSION_STATUSES = [
  "pending",
  "under_review",
  "documents_verified",
  "interview_scheduled",
  "accepted",
  "rejected",
  "waitlisted",
];

exports.DEFAULT_ADMISSION_STATUS = "pending";

exports.isValidAdmissionStatus = (value) =>
  exports.ADMISSION_STATUSES.includes(String(value || "").trim());

exports.ADMISSION_STATUS_LABELS = {
  pending: "Pending",
  under_review: "Under review",
  documents_verified: "Documents verified",
  interview_scheduled: "Interview scheduled",
  accepted: "Accepted",
  rejected: "Rejected",
  waitlisted: "Waitlisted",
};
