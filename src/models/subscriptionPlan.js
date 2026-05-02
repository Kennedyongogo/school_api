const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "SubscriptionPlan",
    {
      id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
      name: { type: DataTypes.STRING(150), allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: true },
      amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
      billing_cycle: {
        type: DataTypes.ENUM("monthly", "quarterly", "semester", "yearly"),
        allowNull: false,
      },
      features: { type: DataTypes.JSONB, defaultValue: {} },
      is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    { tableName: "subscription_plans", timestamps: true, underscored: true }
  );
};
