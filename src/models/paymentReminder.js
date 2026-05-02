const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const PaymentReminder = sequelize.define(
    "PaymentReminder",
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
      reminder_type: {
        type: DataTypes.ENUM("email", "sms", "push", "whatsapp"),
        allowNull: false,
      },
      reminder_stage: {
        type: DataTypes.ENUM("upcoming", "due_today", "overdue_1", "overdue_2", "overdue_3"),
        allowNull: false,
      },
      sent_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      opened_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      link_clicked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: "payment_reminders",
      timestamps: true,
      underscored: true,
    }
  );

  return PaymentReminder;
};
