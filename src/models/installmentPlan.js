const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const InstallmentPlan = sequelize.define(
    "InstallmentPlan",
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
      total_installments: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      installment_interval_days: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      is_default: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: "installment_plans",
      timestamps: true,
      underscored: true,
    }
  );

  return InstallmentPlan;
};
