const {
  deactivateStudentManually,
  runOverduePaymentCheck,
} = require("../services/deactivationService");
const { reactivateStudentManually } = require("../services/reactivationService");

exports.manualDeactivate = async (req, res) => {
  try {
    const { student_id, reason } = req.body;
    if (!student_id || !reason) {
      return res.status(400).json({
        success: false,
        message: "student_id and reason are required",
      });
    }
    await deactivateStudentManually(student_id, {
      reason,
      performedByUserId: req.user?.id,
      ipAddress: req.ip,
    });
    return res.status(201).json({ success: true, message: "Student deactivated" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.manualReactivate = async (req, res) => {
  try {
    const { student_id, reason, force } = req.body;
    if (!student_id) {
      return res.status(400).json({ success: false, message: "student_id is required" });
    }
    const result = await reactivateStudentManually(student_id, {
      reason,
      performedByUserId: req.user?.id,
      ipAddress: req.ip,
      force: !!force,
    });
    return res.json({ success: true, ...result });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.triggerOverdueJob = async (req, res) => {
  try {
    await runOverduePaymentCheck();
    return res.json({ success: true, message: "Overdue payment job finished" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
