const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "EmailQueue",
    {
      id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
      to_email: { type: DataTypes.STRING(100), allowNull: false },
      to_name: { type: DataTypes.STRING(100), allowNull: true },
      template_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "notification_templates", key: "id" },
      },
      variables: { type: DataTypes.JSONB, defaultValue: {} },
      status: {
        type: DataTypes.ENUM("pending", "sent", "failed", "retry"),
        defaultValue: "pending",
      },
      attempts: { type: DataTypes.INTEGER, defaultValue: 0 },
      sent_at: { type: DataTypes.DATE, allowNull: true },
      error_message: { type: DataTypes.TEXT, allowNull: true },
    },
    { tableName: "email_queue", timestamps: true, underscored: true }
  );
};
