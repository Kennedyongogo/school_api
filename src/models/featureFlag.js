const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "FeatureFlag",
    {
      id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
      name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
      is_enabled: { type: DataTypes.BOOLEAN, defaultValue: false },
      rollout_percentage: { type: DataTypes.INTEGER, defaultValue: 0 },
      enabled_for_roles: { type: DataTypes.JSONB, defaultValue: [] },
      enabled_for_users: { type: DataTypes.JSONB, defaultValue: [] },
      created_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "users", key: "id" },
      },
    },
    { tableName: "feature_flags", timestamps: true, underscored: true }
  );
};
