const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "Coupon",
    {
      id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
      code: { type: DataTypes.STRING(40), allowNull: false, unique: true },
      type: {
        type: DataTypes.ENUM("percentage", "fixed", "free_trial"),
        allowNull: false,
      },
      value: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
      valid_from: { type: DataTypes.DATE, allowNull: false },
      valid_to: { type: DataTypes.DATE, allowNull: false },
      usage_limit: { type: DataTypes.INTEGER, allowNull: true },
      used_count: { type: DataTypes.INTEGER, defaultValue: 0 },
      minimum_purchase: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
      applicable_courses: { type: DataTypes.JSONB, defaultValue: [] },
      is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    { tableName: "coupons", timestamps: true, underscored: true }
  );
};
