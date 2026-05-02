const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const LessonProgress = sequelize.define(
    "LessonProgress",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      syllabus_chapter_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "syllabus_chapters", key: "id" },
      },
      class_session_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "class_sessions", key: "id" },
      },
      percentage_covered: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      topics_covered: {
        type: DataTypes.JSONB,
        defaultValue: [],
      },
      student_mastery_level: {
        type: DataTypes.DECIMAL(3, 2),
        defaultValue: 0,
      },
      additional_notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "lesson_progresses",
      timestamps: true,
      underscored: true,
      indexes: [{ unique: true, fields: ["syllabus_chapter_id", "class_session_id"] }],
    }
  );

  return LessonProgress;
};
