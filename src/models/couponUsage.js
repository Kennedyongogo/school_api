const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "CouponUsage",
    {
      id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
      coupon_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "coupons", key: "id" },
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
      },
      used_at: { type: DataTypes.DATE, allowNull: false },
      discount_amount: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
      invoice_id: { type: DataTypes.UUID, allowNull: true },
    },
    { tableName: "coupon_usages", timestamps: true, underscored: true }
  );
};
