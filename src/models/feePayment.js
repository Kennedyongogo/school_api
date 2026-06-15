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
<<<<<<< HEAD
      student_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "students", key: "id" },
      },
=======
>>>>>>> dbf38d6042c6ec91a0dd55101879df2f1e151a96
      parent_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "parents", key: "id" },
      },
<<<<<<< HEAD
=======
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
>>>>>>> dbf38d6042c6ec91a0dd55101879df2f1e151a96
      amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
<<<<<<< HEAD
      applied_to_invoice: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },
      excess_amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },
      payment_method: {
        type: DataTypes.STRING(40),
=======
      payment_method: {
        type: DataTypes.STRING(24),
>>>>>>> dbf38d6042c6ec91a0dd55101879df2f1e151a96
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
<<<<<<< HEAD
=======
      recorded_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "users", key: "id" },
      },
>>>>>>> dbf38d6042c6ec91a0dd55101879df2f1e151a96
      paid_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
<<<<<<< HEAD
      recorded_by_user_id: {
        type: DataTypes.UUID,
        allowNull: true,
        field: "recorded_by",
        references: { model: "users", key: "id" },
      },
=======
>>>>>>> dbf38d6042c6ec91a0dd55101879df2f1e151a96
    },
    {
      tableName: "fee_payments",
      timestamps: true,
      underscored: true,
    }
  );

  return FeePayment;
};
