const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "Referral",
    {
      id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
      referrer_user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
      },
      referred_email: { type: DataTypes.STRING(100), allowNull: false },
      referred_user_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "users", key: "id" },
      },
      status: {
        type: DataTypes.ENUM("pending", "converted", "expired"),
        defaultValue: "pending",
      },
      reward_given: { type: DataTypes.BOOLEAN, defaultValue: false },
      reward_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
      converted_at: { type: DataTypes.DATE, allowNull: true },
    },
    { tableName: "referrals", timestamps: true, underscored: true }
  );
};
