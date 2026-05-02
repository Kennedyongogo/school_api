const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const SubjectAverage = sequelize.define(
    "SubjectAverage",
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
      subject_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "subjects", key: "id" },
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
      total_score: {
        type: DataTypes.DECIMAL(8, 2),
        defaultValue: 0,
      },
      total_possible: {
        type: DataTypes.DECIMAL(8, 2),
        defaultValue: 0,
      },
      average_percentage: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0,
      },
      weighted_score: {
        type: DataTypes.DECIMAL(8, 2),
        defaultValue: 0,
      },
      grade_letter: {
        type: DataTypes.STRING(5),
        allowNull: true,
      },
      gpa_equivalent: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: true,
      },
      rank_in_class: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      rank_in_grade: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      tableName: "subject_averages",
      timestamps: true,
      underscored: true,
      indexes: [{ unique: true, fields: ["student_id", "subject_id", "semester_id"] }],
    }
  );

  return SubjectAverage;
};
