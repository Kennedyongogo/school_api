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
        type: DataTypes.STRING(40),
        allowNull: false,
        unique: true,
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
      fee_structure_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "fee_structures", key: "id" },
      },
      curriculum_class_level_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "curriculum_class_levels", key: "id" },
      },
      fee_snapshot_json: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {},
      },
      amount_due: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },
      amount_paid: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },
      balance: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },
      status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "draft",
      },
      sent_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "fee_invoices",
      timestamps: true,
      underscored: true,
    }
  );

  return FeeInvoice;
};
