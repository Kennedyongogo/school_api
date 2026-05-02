const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "Course",
    {
      id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
      title: { type: DataTypes.STRING(200), allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: true },
      subject_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "subjects", key: "id" },
      },
      grade_level_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "grade_levels", key: "id" },
      },
      instructor_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "teachers", key: "id" },
      },
      thumbnail_url: { type: DataTypes.STRING(500), allowNull: true },
      duration_hours: { type: DataTypes.INTEGER, defaultValue: 0 },
      level: {
        type: DataTypes.ENUM("beginner", "intermediate", "advanced"),
        defaultValue: "beginner",
      },
      is_published: { type: DataTypes.BOOLEAN, defaultValue: false },
      enrollment_count: { type: DataTypes.INTEGER, defaultValue: 0 },
    },
    { tableName: "courses", timestamps: true, underscored: true }
  );
};
