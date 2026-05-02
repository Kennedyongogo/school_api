const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "CourseEnrollment",
    {
      id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
      course_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "courses", key: "id" },
      },
      student_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "students", key: "id" },
      },
      enrolled_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      progress_percentage: { type: DataTypes.INTEGER, defaultValue: 0 },
      last_accessed_at: { type: DataTypes.DATE, allowNull: true },
      is_completed: { type: DataTypes.BOOLEAN, defaultValue: false },
      certificate_issued: { type: DataTypes.BOOLEAN, defaultValue: false },
    },
    {
      tableName: "course_enrollments",
      timestamps: true,
      underscored: true,
      indexes: [{ unique: true, fields: ["course_id", "student_id"] }],
    }
  );
};
