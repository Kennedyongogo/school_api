const { sequelize, Curriculum, CurriculumClass, CurriculumClassLevel, Student, User } = require("../models");

const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function normalizeUuid(value, label) {
  const id = String(value || "").trim();
  if (!id || !uuidRe.test(id)) {
    const err = new Error(`${label} is invalid.`);
    err.status = 400;
    throw err;
  }
  return id;
}

function mapClassTransferStudent(row) {
  const plain = row.get({ plain: true });
  return {
    id: plain.id,
    admission_number: plain.admission_number,
    gender: plain.gender,
    enrollment_date: plain.enrollment_date,
    full_name: plain.user?.full_name || null,
    username: plain.user?.username || null,
    email: plain.user?.email || null,
    profile_image: plain.user?.profile_image || null,
  };
}

/** Curricula for class-transfer tabs (updates when new curricula are added). */
exports.listClassTransferCurricula = async (req, res) => {
  try {
    const rows = await Curriculum.findAll({
      attributes: ["id", "name", "type", "description", "period"],
      order: [["name", "ASC"]],
    });
    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Could not load curricula." });
  }
};

/** All classes in a curriculum with counts for the class-transfer carousel. */
exports.listClassTransferClasses = async (req, res) => {
  try {
    const curriculumId = String(req.params.curriculumId || "").trim();
    if (!curriculumId) {
      return res.status(400).json({ success: false, message: "curriculumId is required." });
    }

    const curriculum = await Curriculum.findByPk(curriculumId, {
      attributes: ["id", "name", "type", "description", "period"],
    });
    if (!curriculum) {
      return res.status(404).json({ success: false, message: "Curriculum not found." });
    }

    const classes = await CurriculumClass.findAll({
      where: { curriculum_id: curriculumId },
      attributes: [
        "id",
        "curriculum_id",
        "name",
        "code",
        "description",
        "period",
        "is_active",
        "created_at",
        "updated_at",
        [
          sequelize.literal(`(
            SELECT COUNT(*)::int
            FROM students s
            WHERE s.curriculum_class_id = "CurriculumClass".id
          )`),
          "student_count",
        ],
        [
          sequelize.literal(`(
            SELECT COUNT(*)::int
            FROM curriculum_class_levels l
            WHERE l.curriculum_class_id = "CurriculumClass".id
          )`),
          "level_count",
        ],
      ],
      order: [["name", "ASC"]],
    });

    const data = classes.map((row) => {
      const plain = row.get({ plain: true });
      return {
        id: plain.id,
        curriculum_id: plain.curriculum_id,
        name: plain.name,
        code: plain.code,
        description: plain.description,
        period: plain.period,
        is_active: plain.is_active,
        student_count: Number(plain.student_count) || 0,
        level_count: Number(plain.level_count) || 0,
        created_at: plain.created_at,
        updated_at: plain.updated_at,
      };
    });

    return res.json({
      success: true,
      data: {
        curriculum,
        classes: data,
        total: data.length,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Could not load classes." });
  }
};

/** Terms / levels inside a class for class-transfer tabs. */
exports.listClassTransferLevels = async (req, res) => {
  try {
    const classId = normalizeUuid(req.params.classId, "classId");
    const cls = await CurriculumClass.findByPk(classId, {
      attributes: ["id", "name", "code", "curriculum_id"],
    });
    if (!cls) {
      return res.status(404).json({ success: false, message: "Class not found." });
    }

    const levels = await CurriculumClassLevel.findAll({
      where: { curriculum_class_id: classId },
      attributes: [
        "id",
        "curriculum_class_id",
        "name",
        "level_order",
        "description",
        "start_date",
        "end_date",
        [
          sequelize.literal(`(
            SELECT COUNT(*)::int
            FROM students s
            WHERE s.curriculum_class_level_id = "CurriculumClassLevel".id
              AND s.curriculum_class_id = ${sequelize.escape(classId)}
          )`),
          "student_count",
        ],
      ],
      order: [
        ["level_order", "ASC"],
        ["name", "ASC"],
      ],
    });

    const data = levels.map((row) => {
      const plain = row.get({ plain: true });
      return {
        id: plain.id,
        curriculum_class_id: plain.curriculum_class_id,
        name: plain.name,
        level_order: plain.level_order,
        description: plain.description,
        start_date: plain.start_date,
        end_date: plain.end_date,
        student_count: Number(plain.student_count) || 0,
      };
    });

    const levelIds = data.map((level) => level.id);
    const studentsByLevel = Object.fromEntries(levelIds.map((id) => [id, []]));

    if (levelIds.length) {
      const studentRows = await Student.findAll({
        where: {
          curriculum_class_id: classId,
          curriculum_class_level_id: levelIds,
        },
        attributes: ["id", "admission_number", "gender", "enrollment_date", "curriculum_class_level_id"],
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "full_name", "username", "email", "profile_image"],
          },
        ],
        order: [["admission_number", "ASC"]],
        limit: 2000,
      });

      for (const row of studentRows) {
        const plain = row.get({ plain: true });
        const levelId = plain.curriculum_class_level_id;
        if (!levelId || !studentsByLevel[levelId]) continue;
        studentsByLevel[levelId].push(mapClassTransferStudent(row));
      }
    }

    const levelsWithStudents = data.map((level) => ({
      ...level,
      students: studentsByLevel[level.id] || [],
    }));

    return res.json({
      success: true,
      data: {
        class: cls,
        levels: levelsWithStudents,
        total: levelsWithStudents.length,
      },
    });
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({ success: false, message: error.message || "Could not load terms." });
  }
};

/** Students enrolled in a class term for class-transfer roster. */
exports.listClassTransferLevelStudents = async (req, res) => {
  try {
    const classId = normalizeUuid(req.params.classId, "classId");
    const levelId = normalizeUuid(req.params.levelId, "levelId");

    const level = await CurriculumClassLevel.findOne({
      where: { id: levelId, curriculum_class_id: classId },
      attributes: ["id", "name", "level_order", "curriculum_class_id"],
    });
    if (!level) {
      return res.status(404).json({ success: false, message: "Term not found in this class." });
    }

    const rows = await Student.findAll({
      where: {
        curriculum_class_id: classId,
        curriculum_class_level_id: levelId,
      },
      attributes: ["id", "admission_number", "gender", "enrollment_date", "curriculum_class_level_id"],
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "full_name", "username", "email", "profile_image"],
        },
      ],
      order: [
        ["admission_number", "ASC"],
      ],
      limit: 500,
    });

    const students = rows.map(mapClassTransferStudent);

    return res.json({
      success: true,
      data: {
        level,
        students,
        total: students.length,
      },
    });
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({ success: false, message: error.message || "Could not load students." });
  }
};
