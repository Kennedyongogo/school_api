const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "ApiUsage",
    {
      id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
      endpoint: { type: DataTypes.STRING(300), allowNull: false },
      method: { type: DataTypes.STRING(10), allowNull: false },
      user_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "users", key: "id" },
      },
      response_time_ms: { type: DataTypes.INTEGER, allowNull: true },
      status_code: { type: DataTypes.INTEGER, allowNull: true },
      ip_address: { type: DataTypes.STRING(45), allowNull: true },
      timestamp: { type: DataTypes.DATE, allowNull: false },
    },
    { tableName: "api_usage", timestamps: false, underscored: true }
  );
};
