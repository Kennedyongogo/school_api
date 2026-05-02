const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const FeeDiscount = sequelize.define(
    "FeeDiscount",
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
      academic_year_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "academic_years", key: "id" },
      },
      term_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "academic_terms", key: "id" },
      },
      discount_type: {
        type: DataTypes.ENUM(
          "scholarship",
          "sibling",
          "early_bird",
          "financial_aid",
          "staff_child",
          "bulk_payment",
          "other"
        ),
        allowNull: false,
      },
      percentage: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },
      fixed_amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
      },
      reason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      approved_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "users", key: "id" },
      },
      approved_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: "fee_discounts",
      timestamps: true,
      underscored: true,
    }
  );

  return FeeDiscount;
};
