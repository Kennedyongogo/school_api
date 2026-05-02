const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const OverallAverage = sequelize.define(
    "OverallAverage",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      student_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "students", key: "id" },
      },
      semester_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "semesters", key: "id" },
      },
      academic_year_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "academic_years", key: "id" },
      },
      total_subjects: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      overall_percentage: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0,
      },
      overall_gpa: {
        type: DataTypes.DECIMAL(3, 2),
        defaultValue: 0,
      },
      overall_grade: {
        type: DataTypes.STRING(5),
        allowNull: true,
      },
      class_position: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      grade_position: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      total_students_in_class: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      total_students_in_grade: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      remarks: {
        type: DataTypes.ENUM(
          "Excellent",
          "Good",
          "Satisfactory",
          "Needs Improvement",
          "Poor"
        ),
        allowNull: true,
      },
    },
    {
      tableName: "overall_averages",
      timestamps: true,
      underscored: true,
      indexes: [{ unique: true, fields: ["student_id", "semester_id"] }],
    }
  );

  return OverallAverage;
};
