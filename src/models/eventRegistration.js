const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const EventRegistration = sequelize.define(
    "EventRegistration",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      event_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "events", key: "id" },
      },
      student_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "students", key: "id" },
      },
      parent_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "parents", key: "id" },
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      attended: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      attended_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      payment_status: {
        type: DataTypes.ENUM("pending", "completed", "free"),
        defaultValue: "pending",
      },
      payment_amount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
      },
    },
    {
      tableName: "event_registrations",
      timestamps: true,
      underscored: true,
    }
  );

  return EventRegistration;
};
