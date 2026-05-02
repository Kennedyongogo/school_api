const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "AuditLog",
    {
      id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
      user_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "users", key: "id" },
      },
      action: { type: DataTypes.STRING(120), allowNull: false },
      entity_type: { type: DataTypes.STRING(120), allowNull: false },
      entity_id: { type: DataTypes.UUID, allowNull: true },
      old_values: { type: DataTypes.JSONB, allowNull: true },
      new_values: { type: DataTypes.JSONB, allowNull: true },
      ip_address: { type: DataTypes.STRING(45), allowNull: true },
      user_agent: { type: DataTypes.TEXT, allowNull: true },
      timestamp: { type: DataTypes.DATE, allowNull: false },
    },
    { tableName: "audit_logs", timestamps: false, underscored: true }
  );
};
