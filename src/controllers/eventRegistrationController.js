const { EventRegistration, SchoolEvent } = require("../models");

exports.registerPublic = async (req, res) => {
  try {
    const {
      event_id,
      name,
      email,
      phone,
      student_id,
      parent_id,
    } = req.body;

    if (!event_id || !name || !email) {
      return res.status(400).json({
        success: false,
        message: "event_id, name, and email are required",
      });
    }

    const ev = await SchoolEvent.findByPk(event_id);
    if (!ev || !ev.is_published) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    if (ev.registration_deadline && new Date(ev.registration_deadline) < new Date()) {
      return res.status(400).json({ success: false, message: "Registration deadline has passed" });
    }

    if (ev.max_attendees != null) {
      const count = await EventRegistration.count({ where: { event_id } });
      if (count >= ev.max_attendees) {
        return res.status(400).json({ success: false, message: "Event is full" });
      }
    }

    const fee = Number(ev.fee_amount || 0);
    const row = await EventRegistration.create({
      event_id,
      student_id: student_id || null,
      parent_id: parent_id || null,
      name,
      email,
      phone: phone || null,
      payment_status: fee <= 0 ? "free" : "pending",
      payment_amount: fee,
    });

    return res.status(201).json({ success: true, data: row });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.listRegistrations = async (req, res) => {
  try {
    const where = {};
    if (req.query.event_id) where.event_id = req.query.event_id;
    if (req.query.student_id) where.student_id = req.query.student_id;
    if (req.query.parent_id) where.parent_id = req.query.parent_id;
    if (req.query.payment_status) where.payment_status = req.query.payment_status;

    const rows = await EventRegistration.findAll({
      where,
      order: [["created_at", "DESC"]],
      limit: Math.min(Number(req.query.limit) || 200, 500),
    });
    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getRegistration = async (req, res) => {
  try {
    const row = await EventRegistration.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "Not found" });
    return res.json({ success: true, data: row });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateRegistration = async (req, res) => {
  try {
    const row = await EventRegistration.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "Not found" });

    const allowed = ["attended", "attended_at", "payment_status", "payment_amount", "phone"];
    const patch = {};
    for (const k of allowed) {
      if (req.body[k] !== undefined) patch[k] = req.body[k];
    }
    await row.update(patch);
    return res.json({ success: true, data: row });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteRegistration = async (req, res) => {
  try {
    const row = await EventRegistration.findByPk(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: "Not found" });
    await row.destroy();
    return res.json({ success: true, message: "Deleted" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
