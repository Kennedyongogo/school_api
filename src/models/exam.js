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
      template_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "exam_templates", key: "id" },
      },
      curriculum_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "curricula", key: "id" },
      },
      curriculum_class_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "curriculum_classes", key: "id" },
      },
      semester_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "semesters", key: "id" },
      },
      exam_type: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      total_marks: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      passing_marks: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      duration_minutes: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
      exam_layout_json: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {},
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
    },
  );

  return Exam;
};
