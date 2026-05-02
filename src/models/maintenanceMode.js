const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "MaintenanceMode",
    {
      id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
      is_enabled: { type: DataTypes.BOOLEAN, defaultValue: false },
      message: { type: DataTypes.TEXT, allowNull: true },
      allowed_ips: { type: DataTypes.JSONB, defaultValue: [] },
      allowed_roles: { type: DataTypes.JSONB, defaultValue: [] },
      started_at: { type: DataTypes.DATE, allowNull: true },
      ends_at: { type: DataTypes.DATE, allowNull: true },
      enabled_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "users", key: "id" },
      },
    },
    { tableName: "maintenance_modes", timestamps: true, underscored: true }
  );
};
