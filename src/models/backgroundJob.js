const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "BackgroundJob",
    {
      id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
      job_type: {
        type: DataTypes.ENUM("email", "report", "export", "import", "backup"),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("pending", "processing", "completed", "failed"),
        defaultValue: "pending",
      },
      payload: { type: DataTypes.JSONB, defaultValue: {} },
      priority: { type: DataTypes.INTEGER, defaultValue: 0 },
      attempts: { type: DataTypes.INTEGER, defaultValue: 0 },
      max_attempts: { type: DataTypes.INTEGER, defaultValue: 3 },
      scheduled_for: { type: DataTypes.DATE, allowNull: true },
      started_at: { type: DataTypes.DATE, allowNull: true },
      completed_at: { type: DataTypes.DATE, allowNull: true },
      error_message: { type: DataTypes.TEXT, allowNull: true },
      result: { type: DataTypes.JSONB, allowNull: true },
    },
    { tableName: "background_jobs", timestamps: true, underscored: true }
  );
};
