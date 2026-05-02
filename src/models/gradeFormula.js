const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const GradeFormula = sequelize.define(
    "GradeFormula",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      grade_level_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "grade_levels", key: "id" },
      },
      grading_system_type: {
        type: DataTypes.ENUM(
          "american",
          "british",
          "ib",
          "percentage",
          "gpa",
          "cambridge"
        ),
        allowNull: false,
      },
      formula_config: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {
          exam_weight: 0.4,
          quiz_weight: 0.2,
          assignment_weight: 0.15,
          project_weight: 0.15,
          participation_weight: 0.1,
        },
      },
      calculation_method: {
        type: DataTypes.ENUM("weighted_average", "best_of", "cumulative"),
        defaultValue: "weighted_average",
      },
    },
    {
      tableName: "grade_formulas",
      timestamps: true,
      underscored: true,
    }
  );

  return GradeFormula;
};
