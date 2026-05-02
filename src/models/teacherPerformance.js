const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "TeacherPerformance",
    {
      id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
      teacher_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "teachers", key: "id" },
      },
      period_start: { type: DataTypes.DATEONLY, allowNull: false },
      period_end: { type: DataTypes.DATEONLY, allowNull: false },
      classes_conducted: { type: DataTypes.INTEGER, defaultValue: 0 },
      average_attendance_rate: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
      average_student_satisfaction: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
      assignments_graded: { type: DataTypes.INTEGER, defaultValue: 0 },
      response_time_hours: { type: DataTypes.DECIMAL(8, 2), allowNull: true },
    },
    { tableName: "teacher_performances", timestamps: true, underscored: true }
  );
};
