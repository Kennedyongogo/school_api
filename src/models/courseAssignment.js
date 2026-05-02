const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "CourseAssignment",
    {
      id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
      lesson_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "lessons", key: "id" },
      },
      title: { type: DataTypes.STRING(200), allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: true },
      due_date: { type: DataTypes.DATE, allowNull: true },
      total_marks: { type: DataTypes.INTEGER, defaultValue: 100 },
      passing_marks: { type: DataTypes.INTEGER, defaultValue: 50 },
      allowed_attempts: { type: DataTypes.INTEGER, defaultValue: 1 },
    },
    { tableName: "course_assignments", timestamps: true, underscored: true }
  );
};
