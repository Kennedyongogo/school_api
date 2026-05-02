const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "ImportJob",
    {
      id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
      },
      import_type: {
        type: DataTypes.ENUM("students", "grades", "users"),
        allowNull: false,
      },
      file_url: { type: DataTypes.STRING(500), allowNull: false },
      mapping: { type: DataTypes.JSONB, defaultValue: {} },
      total_records: { type: DataTypes.INTEGER, defaultValue: 0 },
      processed_records: { type: DataTypes.INTEGER, defaultValue: 0 },
      failed_records: { type: DataTypes.INTEGER, defaultValue: 0 },
      errors: { type: DataTypes.JSONB, defaultValue: [] },
      status: {
        type: DataTypes.ENUM("pending", "processing", "completed", "failed"),
        defaultValue: "pending",
      },
    },
    { tableName: "import_jobs", timestamps: true, underscored: true }
  );
};
