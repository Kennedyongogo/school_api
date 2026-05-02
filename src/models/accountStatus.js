const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const AccountStatus = sequelize.define(
    "AccountStatus",
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
      status: {
        type: DataTypes.ENUM(
          "active",
          "pending_payment",
          "suspended",
          "deactivated",
          "expelled",
          "graduated",
          "withdrawn"
        ),
        allowNull: false,
        defaultValue: "active",
      },
      reason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      triggered_by: {
        type: DataTypes.ENUM("system", "admin", "parent_request"),
        defaultValue: "system",
      },
      deactivated_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      reactivated_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      outstanding_balance: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
      },
      grace_period_end: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      notification_sent: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      reactivation_required: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      reactivation_token: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      admin_notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "account_statuses",
      timestamps: true,
      underscored: true,
    }
  );

  return AccountStatus;
};
