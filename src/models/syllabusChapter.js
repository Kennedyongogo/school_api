const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const SyllabusChapter = sequelize.define(
    "SyllabusChapter",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      syllabus_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "syllabi", key: "id" },
      },
      chapter_number: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      chapter_name: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      learning_objectives: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      key_topics: {
        type: DataTypes.JSONB,
        defaultValue: [],
      },
      estimated_weeks: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },
      start_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      end_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      resources: {
        type: DataTypes.JSONB,
        defaultValue: [],
      },
      is_completed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      completed_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "syllabus_chapters",
      timestamps: true,
      underscored: true,
    }
  );

  return SyllabusChapter;
};
