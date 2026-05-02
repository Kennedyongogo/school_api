const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "RefundRequest",
    {
      id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
      payment_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "installment_payments", key: "id" },
      },
      amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
      reason: { type: DataTypes.TEXT, allowNull: true },
      status: {
        type: DataTypes.ENUM("pending", "approved", "rejected", "completed"),
        defaultValue: "pending",
      },
      requested_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "users", key: "id" },
      },
      approved_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "users", key: "id" },
      },
      processed_at: { type: DataTypes.DATE, allowNull: true },
      refund_transaction_id: { type: DataTypes.STRING(120), allowNull: true },
    },
    { tableName: "refund_requests", timestamps: true, underscored: true }
  );
};
