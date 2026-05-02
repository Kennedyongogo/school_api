const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "DiscussionReply",
    {
      id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
      discussion_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "course_discussions", key: "id" },
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
      },
      content: { type: DataTypes.TEXT, allowNull: false },
      parent_reply_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "discussion_replies", key: "id" },
      },
    },
    { tableName: "discussion_replies", timestamps: true, underscored: true }
  );
};
