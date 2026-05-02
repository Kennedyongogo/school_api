const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ClassSession = sequelize.define(
    "ClassSession",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      class_assignment_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "class_assignments", key: "id" },
      },
      teacher_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "teachers", key: "id" },
      },
      section_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "sections", key: "id" },
      },
      subject_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "subjects", key: "id" },
      },
      syllabus_chapter_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "syllabus_chapters", key: "id" },
      },
      session_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      start_time: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      end_time: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      actual_start_time: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      actual_end_time: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      topics_covered: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      teaching_methods: {
        type: DataTypes.JSONB,
        defaultValue: [],
      },
      materials_used: {
        type: DataTypes.JSONB,
        defaultValue: [],
      },
      homework_given: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      next_session_preview: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      teacher_notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("scheduled", "in_progress", "completed", "cancelled"),
        defaultValue: "scheduled",
      },
      cancellation_reason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      is_recorded: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      recording_url: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      online_session_link: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
    },
    {
      tableName: "class_sessions",
      timestamps: true,
      underscored: true,
    }
  );

  return ClassSession;
};
