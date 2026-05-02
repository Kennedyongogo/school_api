const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const FeeStructure = sequelize.define(
    "FeeStructure",
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
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      category: {
        type: DataTypes.ENUM(
          "tuition",
          "registration",
          "exam",
          "library",
          "sports",
          "technology",
          "activity",
          "other"
        ),
        allowNull: false,
      },
      amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      is_per_term: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      is_mandatory: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      grade_level_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "grade_levels", key: "id" },
      },
      academic_year_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "academic_years", key: "id" },
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: "fee_structures",
      timestamps: true,
      underscored: true,
    }
  );

  return FeeStructure;
};
