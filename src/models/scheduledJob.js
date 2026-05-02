const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "ScheduledJob",
    {
      id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
      name: { type: DataTypes.STRING(120), allowNull: false },
      job_type: { type: DataTypes.STRING(80), allowNull: false },
      cron_expression: { type: DataTypes.STRING(80), allowNull: true },
      last_run: { type: DataTypes.DATE, allowNull: true },
      next_run: { type: DataTypes.DATE, allowNull: true },
      status: {
        type: DataTypes.ENUM("active", "paused", "disabled"),
        defaultValue: "active",
      },
      last_result: {
        type: DataTypes.ENUM("success", "failed"),
        allowNull: true,
      },
      last_error: { type: DataTypes.TEXT, allowNull: true },
    },
    { tableName: "scheduled_jobs", timestamps: true, underscored: true }
  );
};
