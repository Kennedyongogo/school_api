const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const StudentAnswer = sequelize.define(
    "StudentAnswer",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      exam_attempt_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "exam_attempts", key: "id" },
      },
      question_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "exam_questions", key: "id" },
      },
      student_answer: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      is_correct: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      marks_obtained: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0,
      },
      auto_graded: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      graded_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "users", key: "id" },
      },
      graded_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      teacher_remarks: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "student_answers",
      timestamps: true,
      underscored: true,
      indexes: [{ unique: true, fields: ["exam_attempt_id", "question_id"] }],
    }
  );

  return StudentAnswer;
};
