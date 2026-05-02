const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "PaymentGateway",
    {
      id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
      name: { type: DataTypes.STRING(100), allowNull: false },
      provider: {
        type: DataTypes.ENUM("stripe", "paypal", "mpesa", "flutterwave"),
        allowNull: false,
      },
      public_key: { type: DataTypes.TEXT, allowNull: true },
      secret_key: { type: DataTypes.TEXT, allowNull: true },
      webhook_secret: { type: DataTypes.TEXT, allowNull: true },
      is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
      is_default: { type: DataTypes.BOOLEAN, defaultValue: false },
      mode: {
        type: DataTypes.ENUM("sandbox", "production"),
        defaultValue: "sandbox",
      },
    },
    { tableName: "payment_gateways", timestamps: true, underscored: true }
  );
};
