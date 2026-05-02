const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "DailyReport",
    {
      id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
      report_date: { type: DataTypes.DATEONLY, allowNull: false, unique: true },
      new_registrations: { type: DataTypes.INTEGER, defaultValue: 0 },
      active_students: { type: DataTypes.INTEGER, defaultValue: 0 },
      classes_today: { type: DataTypes.INTEGER, defaultValue: 0 },
      attendance_rate: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
      payments_received: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
      support_tickets: { type: DataTypes.INTEGER, defaultValue: 0 },
    },
    { tableName: "daily_reports", timestamps: true, underscored: true }
  );
};
