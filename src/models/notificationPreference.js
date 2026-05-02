const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "NotificationPreference",
    {
      id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
      },
      type: {
        type: DataTypes.ENUM("email", "sms", "push", "inapp"),
        allowNull: false,
      },
      enabled: { type: DataTypes.BOOLEAN, defaultValue: true },
      frequency: {
        type: DataTypes.ENUM("instant", "daily", "weekly"),
        defaultValue: "instant",
      },
    },
    {
      tableName: "notification_preferences",
      timestamps: true,
      underscored: true,
      indexes: [{ unique: true, fields: ["user_id", "type"] }],
    }
  );
};
