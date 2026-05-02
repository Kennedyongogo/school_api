const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const PaymentGracePeriod = sequelize.define(
    "PaymentGracePeriod",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      academic_year_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "academic_years", key: "id" },
      },
      term_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "academic_terms", key: "id" },
      },
      grace_days: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 14,
      },
      warning_days: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: [3, 7, 10],
      },
      reconnection_fee: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: "payment_grace_periods",
      timestamps: true,
      underscored: true,
      indexes: [{ unique: true, fields: ["academic_year_id", "term_id"] }],
    }
  );

  return PaymentGracePeriod;
};
