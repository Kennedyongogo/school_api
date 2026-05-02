const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const DeactivationLog = sequelize.define(
    "DeactivationLog",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      student_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "students", key: "id" },
      },
      parent_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "parents", key: "id" },
      },
      action: {
        type: DataTypes.ENUM(
          "warning_sent",
          "grace_period_started",
          "deactivated",
          "reactivated",
          "manual_override"
        ),
        allowNull: false,
      },
      reason: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      outstanding_amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
      },
      installment_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "installments", key: "id" },
      },
      performed_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "users", key: "id" },
      },
      ip_address: {
        type: DataTypes.STRING(45),
        allowNull: true,
      },
      metadata: {
        type: DataTypes.JSONB,
        defaultValue: {},
      },
    },
    {
      tableName: "deactivation_logs",
      timestamps: true,
      underscored: true,
    }
  );

  return DeactivationLog;
};
