const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ExamSchedule = sequelize.define(
    "ExamSchedule",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      exam_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "exams", key: "id" },
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
      curriculum_class_level_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "curriculum_class_levels", key: "id" },
      },
      teacher_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "teachers", key: "id" },
      },
      start_time: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      end_time: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      timezone: {
        type: DataTypes.STRING(64),
        allowNull: false,
        defaultValue: "Africa/Nairobi",
      },
      status: {
        type: DataTypes.ENUM("draft", "scheduled", "live", "completed", "cancelled"),
        allowNull: false,
        defaultValue: "scheduled",
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      allow_late_join_minutes: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 10,
      },
      max_attempts: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      requires_webcam: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      prevent_tab_switch: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      proctoring_mode: {
        type: DataTypes.ENUM("none", "record_only", "live_monitor", "strict_auto"),
        allowNull: false,
        defaultValue: "none",
      },
      proctoring_rules_json: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      meeting_provider: {
        type: DataTypes.STRING(40),
        allowNull: true,
      },
      meeting_id: {
        type: DataTypes.STRING(128),
        allowNull: true,
      },
      meeting_join_url: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      meeting_host_url: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      created_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "users", key: "id" },
      },
      updated_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "users", key: "id" },
      },
    },
    {
      tableName: "exam_schedules",
      timestamps: true,
      underscored: true,
    }
  );

  return ExamSchedule;
};
