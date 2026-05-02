const { DataTypes } = require("sequelize");

/** Assessment category weights (distinct from online `Exam` entity). */
module.exports = (sequelize) => {
  const AssessmentExamType = sequelize.define(
    "AssessmentExamType",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      name: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      weight_percentage: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
      },
      category: {
        type: DataTypes.ENUM(
          "exam",
          "quiz",
          "assignment",
          "project",
          "participation"
        ),
        allowNull: false,
      },
    },
    {
      tableName: "exam_types",
      timestamps: true,
      underscored: true,
    }
  );

  return AssessmentExamType;
};
