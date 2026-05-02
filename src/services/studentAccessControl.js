const { Op } = require("sequelize");
const { ExamAttempt, ProctoringSession, OnlineSessionTracking } = require("../models");

async function blockStudentAccess(studentId) {
  await ExamAttempt.update(
    {
      status: "cancelled",
      is_cancelled: true,
      cancellation_reason: "Account deactivated",
    },
    {
      where: {
        student_id: studentId,
        status: "in_progress",
      },
    }
  );

  const attemptRows = await ExamAttempt.findAll({
    where: { student_id: studentId },
    attributes: ["id"],
  });
  const attemptIds = attemptRows.map((r) => r.id);
  if (attemptIds.length > 0) {
    await ProctoringSession.update(
      { status: "ended", session_end: new Date() },
      {
        where: {
          exam_attempt_id: { [Op.in]: attemptIds },
          status: "active",
        },
      }
    );
  }

  await OnlineSessionTracking.update(
    { is_connected: false, left_at: new Date() },
    {
      where: {
        student_id: studentId,
        is_connected: true,
      },
    }
  );
}

module.exports = { blockStudentAccess };
