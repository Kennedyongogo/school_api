const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const InstallmentPayment = sequelize.define(
    "InstallmentPayment",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      installment_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "installments", key: "id" },
      },
      parent_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "parents", key: "id" },
      },
      student_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "students", key: "id" },
      },
      amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      late_fee_included: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
      },
      payment_method: {
        type: DataTypes.ENUM(
          "cash",
          "bank_transfer",
          "credit_card",
          "debit_card",
          "mobile_money",
          "check",
          "stripe",
          "paypal"
        ),
        allowNull: false,
      },
      transaction_id: {
        type: DataTypes.STRING(100),
        allowNull: true,
        unique: true,
      },
      payment_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      receipt_number: {
        type: DataTypes.STRING(50),
        allowNull: true,
        unique: true,
      },
      status: {
        type: DataTypes.ENUM("pending", "completed", "failed", "refunded"),
        defaultValue: "pending",
      },
      payment_proof_url: {
        type: DataTypes.STRING(500),
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
    },
    {
      tableName: "installment_payments",
      timestamps: true,
      underscored: true,
    }
  );

  return InstallmentPayment;
};
