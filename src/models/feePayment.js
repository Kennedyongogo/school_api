const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const FeePayment = sequelize.define(
    "FeePayment",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      fee_invoice_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "fee_invoices", key: "id" },
      },
      parent_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "parents", key: "id" },
      },
      student_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "students", key: "id" },
      },
      curriculum_class_level_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "curriculum_class_levels", key: "id" },
      },
      amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      payment_method: {
        type: DataTypes.STRING(24),
        allowNull: false,
        defaultValue: "manual",
      },
      reference: {
        type: DataTypes.STRING(120),
        allowNull: true,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      recorded_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "users", key: "id" },
      },
      paid_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "fee_payments",
      timestamps: true,
      underscored: true,
    }
  );

  return FeePayment;
};
