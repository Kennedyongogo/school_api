const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "CourseDiscussion",
    {
      id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
      lesson_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "lessons", key: "id" },
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
      },
      title: { type: DataTypes.STRING(200), allowNull: false },
      content: { type: DataTypes.TEXT, allowNull: false },
      is_pinned: { type: DataTypes.BOOLEAN, defaultValue: false },
      is_resolved: { type: DataTypes.BOOLEAN, defaultValue: false },
    },
    { tableName: "course_discussions", timestamps: true, underscored: true }
  );
};
