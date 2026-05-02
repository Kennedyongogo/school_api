const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "WebhookLog",
    {
      id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
      gateway_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "payment_gateways", key: "id" },
      },
      event_type: { type: DataTypes.STRING(120), allowNull: false },
      payload: { type: DataTypes.JSONB, defaultValue: {} },
      headers: { type: DataTypes.JSONB, defaultValue: {} },
      processed: { type: DataTypes.BOOLEAN, defaultValue: false },
      processed_at: { type: DataTypes.DATE, allowNull: true },
      error_message: { type: DataTypes.TEXT, allowNull: true },
    },
    { tableName: "webhook_logs", timestamps: true, underscored: true }
  );
};
