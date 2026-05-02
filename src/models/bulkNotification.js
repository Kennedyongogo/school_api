const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "BulkNotification",
    {
      id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
      created_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "users", key: "id" },
      },
      title: { type: DataTypes.STRING(200), allowNull: false },
      message: { type: DataTypes.TEXT, allowNull: false },
      audience: {
        type: DataTypes.ENUM("all", "students", "parents", "teachers", "staff"),
        defaultValue: "all",
      },
      sent_count: { type: DataTypes.INTEGER, defaultValue: 0 },
      failed_count: { type: DataTypes.INTEGER, defaultValue: 0 },
      scheduled_for: { type: DataTypes.DATE, allowNull: true },
      sent_at: { type: DataTypes.DATE, allowNull: true },
    },
    { tableName: "bulk_notifications", timestamps: true, underscored: true }
  );
};
