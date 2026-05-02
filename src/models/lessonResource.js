const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "LessonResource",
    {
      id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
      lesson_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "lessons", key: "id" },
      },
      title: { type: DataTypes.STRING(200), allowNull: false },
      file_url: { type: DataTypes.STRING(500), allowNull: false },
      file_type: {
        type: DataTypes.ENUM("pdf", "doc", "video", "link", "other"),
        defaultValue: "pdf",
      },
      file_size_bytes: { type: DataTypes.BIGINT, allowNull: true },
    },
    { tableName: "lesson_resources", timestamps: true, underscored: true }
  );
};
