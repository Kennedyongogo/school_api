const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "FinancialReport",
    {
      id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
      period_start: { type: DataTypes.DATEONLY, allowNull: false },
      period_end: { type: DataTypes.DATEONLY, allowNull: false },
      total_revenue: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
      total_paid: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
      total_outstanding: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
      total_discounts: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
      collection_rate: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
    },
    { tableName: "financial_reports", timestamps: true, underscored: true }
  );
};
