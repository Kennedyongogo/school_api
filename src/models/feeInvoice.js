const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const FeeInvoice = sequelize.define(
    "FeeInvoice",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      invoice_number: {
<<<<<<< HEAD
        type: DataTypes.STRING(32),
        allowNull: false,
        unique: true,
      },
      student_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "students", key: "id" },
      },
=======
        type: DataTypes.STRING(40),
        allowNull: false,
        unique: true,
      },
>>>>>>> dbf38d6042c6ec91a0dd55101879df2f1e151a96
      parent_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "parents", key: "id" },
      },
<<<<<<< HEAD
      curriculum_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "curricula", key: "id" },
      },
      curriculum_class_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "curriculum_classes", key: "id" },
      },
      curriculum_class_level_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "curriculum_class_levels", key: "id" },
=======
      student_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "students", key: "id" },
>>>>>>> dbf38d6042c6ec91a0dd55101879df2f1e151a96
      },
      fee_structure_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "fee_structures", key: "id" },
      },
<<<<<<< HEAD
      term_fee_amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
=======
      curriculum_class_level_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "curriculum_class_levels", key: "id" },
      },
      fee_snapshot_json: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {},
>>>>>>> dbf38d6042c6ec91a0dd55101879df2f1e151a96
      },
      amount_due: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
<<<<<<< HEAD
=======
        defaultValue: 0,
>>>>>>> dbf38d6042c6ec91a0dd55101879df2f1e151a96
      },
      amount_paid: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },
      balance: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
<<<<<<< HEAD
      },
      payment_breakdown: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: [],
        field: "fee_snapshot_json",
      },
      status: {
        type: DataTypes.STRING(32),
        allowNull: false,
        defaultValue: "draft",
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
=======
        defaultValue: 0,
      },
      status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "draft",
      },
>>>>>>> dbf38d6042c6ec91a0dd55101879df2f1e151a96
      sent_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
<<<<<<< HEAD
=======
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
>>>>>>> dbf38d6042c6ec91a0dd55101879df2f1e151a96
    },
    {
      tableName: "fee_invoices",
      timestamps: true,
      underscored: true,
    }
  );

  return FeeInvoice;
};
