const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "AssignmentSubmission",
    {
      id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
      assignment_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "course_assignments", key: "id" },
      },
      student_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "students", key: "id" },
      },
      submission_url: { type: DataTypes.STRING(500), allowNull: true },
      submitted_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      is_late: { type: DataTypes.BOOLEAN, defaultValue: false },
      marks_obtained: { type: DataTypes.DECIMAL(7, 2), allowNull: true },
      feedback: { type: DataTypes.TEXT, allowNull: true },
      graded_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "users", key: "id" },
      },
      graded_at: { type: DataTypes.DATE, allowNull: true },
    },
    {
      tableName: "assignment_submissions",
      timestamps: true,
      underscored: true,
      indexes: [{ fields: ["assignment_id", "student_id"] }],
    }
  );
};
