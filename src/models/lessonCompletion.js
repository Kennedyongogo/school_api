const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "LessonCompletion",
    {
      id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
      lesson_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "lessons", key: "id" },
      },
      student_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "students", key: "id" },
      },
      completed_at: { type: DataTypes.DATE, allowNull: true },
      watch_time_seconds: { type: DataTypes.INTEGER, defaultValue: 0 },
      completed_percentage: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
    },
    {
      tableName: "lesson_completions",
      timestamps: true,
      underscored: true,
      indexes: [{ unique: true, fields: ["lesson_id", "student_id"] }],
    }
  );
};
