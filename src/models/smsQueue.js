const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "SmsQueue",
    {
      id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
      phone_number: { type: DataTypes.STRING(20), allowNull: false },
      message: { type: DataTypes.TEXT, allowNull: false },
      status: {
        type: DataTypes.ENUM("pending", "sent", "failed"),
        defaultValue: "pending",
      },
      sent_at: { type: DataTypes.DATE, allowNull: true },
      error_message: { type: DataTypes.TEXT, allowNull: true },
    },
    { tableName: "sms_queue", timestamps: true, underscored: true }
  );
};
