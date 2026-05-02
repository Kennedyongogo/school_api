const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "BackupLog",
    {
      id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
      backup_type: {
        type: DataTypes.ENUM("database", "files", "full"),
        allowNull: false,
      },
      file_url: { type: DataTypes.STRING(500), allowNull: true },
      file_size_bytes: { type: DataTypes.BIGINT, allowNull: true },
      status: {
        type: DataTypes.ENUM("success", "failed"),
        allowNull: false,
      },
      started_at: { type: DataTypes.DATE, allowNull: false },
      completed_at: { type: DataTypes.DATE, allowNull: true },
      error_message: { type: DataTypes.TEXT, allowNull: true },
      created_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "users", key: "id" },
      },
    },
    { tableName: "backup_logs", timestamps: true, underscored: true }
  );
};
