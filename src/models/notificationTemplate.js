const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "NotificationTemplate",
    {
      id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
      name: { type: DataTypes.STRING(100), allowNull: false },
      type: {
        type: DataTypes.ENUM("email", "sms", "push", "inapp"),
        allowNull: false,
      },
      subject: { type: DataTypes.STRING(255), allowNull: true },
      body: { type: DataTypes.TEXT, allowNull: false },
      variables: { type: DataTypes.JSONB, defaultValue: {} },
      is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    { tableName: "notification_templates", timestamps: true, underscored: true }
  );
};
