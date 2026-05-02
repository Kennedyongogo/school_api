const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "ExportJob",
    {
      id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
      },
      export_type: {
        type: DataTypes.ENUM("grades", "attendance", "fees", "students"),
        allowNull: false,
      },
      format: {
        type: DataTypes.ENUM("pdf", "excel", "csv"),
        allowNull: false,
      },
      filters: { type: DataTypes.JSONB, defaultValue: {} },
      file_url: { type: DataTypes.STRING(500), allowNull: true },
      file_size_bytes: { type: DataTypes.BIGINT, allowNull: true },
      expires_at: { type: DataTypes.DATE, allowNull: true },
      status: {
        type: DataTypes.ENUM("pending", "processing", "completed", "failed"),
        defaultValue: "pending",
      },
    },
    { tableName: "export_jobs", timestamps: true, underscored: true }
  );
};
