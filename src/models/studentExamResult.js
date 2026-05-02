const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const StudentExamResult = sequelize.define(
    "StudentExamResult",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      student_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "students", key: "id" },
      },
      exam_attempt_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "exam_attempts", key: "id" },
      },
      subject_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "subjects", key: "id" },
      },
      exam_type_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "exam_types", key: "id" },
      },
      semester_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "semesters", key: "id" },
      },
      marks_obtained: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
      },
      total_marks: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
      },
      percentage: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },
      grade_letter: {
        type: DataTypes.STRING(5),
        allowNull: true,
      },
      gpa_earned: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: true,
      },
      is_best_attempt: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: "student_exam_results",
      timestamps: true,
      underscored: true,
      indexes: [{ unique: true, fields: ["exam_attempt_id"] }],
    }
  );

  return StudentExamResult;
};
