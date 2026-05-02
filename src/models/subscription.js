const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "Subscription",
    {
      id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
      student_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "students", key: "id" },
      },
      plan_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "subscription_plans", key: "id" },
      },
      status: {
        type: DataTypes.ENUM("active", "paused", "cancelled", "expired"),
        defaultValue: "active",
      },
      start_date: { type: DataTypes.DATE, allowNull: false },
      end_date: { type: DataTypes.DATE, allowNull: true },
      auto_renew: { type: DataTypes.BOOLEAN, defaultValue: true },
      cancellation_reason: { type: DataTypes.TEXT, allowNull: true },
    },
    { tableName: "subscriptions", timestamps: true, underscored: true }
  );
};
