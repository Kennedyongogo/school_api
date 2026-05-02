const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const GradingScale = sequelize.define(
    "GradingScale",
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
      system_type: {
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
      grade_letter: {
        type: DataTypes.STRING(5),
        allowNull: false,
      },
      min_percentage: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
      },
      max_percentage: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
      },
      gpa_value: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: true,
      },
      ib_score: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      description: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: "grading_scales",
      timestamps: true,
      underscored: true,
    }
  );

  return GradingScale;
};
