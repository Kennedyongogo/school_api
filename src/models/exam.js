const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Exam = sequelize.define(
    "Exam",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      title: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      subject_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "subjects", key: "id" },
      },
      class_assignment_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "class_assignments", key: "id" },
      },
      total_marks: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      passing_marks: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      duration_minutes: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      question_type: {
        type: DataTypes.ENUM("multiple_choice", "true_false", "essay", "mixed"),
        defaultValue: "multiple_choice",
      },
      requires_webcam: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      prevent_tab_switch: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      allow_retake: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      max_attempts: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },
      instructions: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("draft", "published", "archived"),
        defaultValue: "draft",
      },
      created_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "users", key: "id" },
      },
    },
    {
      tableName: "exams",
      timestamps: true,
      underscored: true,
    }
  );

  return Exam;
};
