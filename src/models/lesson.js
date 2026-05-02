const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "Lesson",
    {
      id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
      course_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "courses", key: "id" },
      },
      title: { type: DataTypes.STRING(200), allowNull: false },
      content_type: {
        type: DataTypes.ENUM("video", "document", "quiz", "assignment"),
        allowNull: false,
      },
      content_url: { type: DataTypes.STRING(500), allowNull: true },
      duration_minutes: { type: DataTypes.INTEGER, defaultValue: 0 },
      order_number: { type: DataTypes.INTEGER, defaultValue: 0 },
      is_free_preview: { type: DataTypes.BOOLEAN, defaultValue: false },
      requires_proctoring: { type: DataTypes.BOOLEAN, defaultValue: false },
    },
    { tableName: "lessons", timestamps: true, underscored: true }
  );
};
