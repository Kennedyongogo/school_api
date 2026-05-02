const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "KnowledgeBase",
    {
      id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
      title: { type: DataTypes.STRING(200), allowNull: false },
      content: { type: DataTypes.TEXT, allowNull: false },
      category: { type: DataTypes.STRING(100), allowNull: true },
      tags: { type: DataTypes.JSONB, defaultValue: [] },
      views: { type: DataTypes.INTEGER, defaultValue: 0 },
      helpful_count: { type: DataTypes.INTEGER, defaultValue: 0 },
      not_helpful_count: { type: DataTypes.INTEGER, defaultValue: 0 },
      is_published: { type: DataTypes.BOOLEAN, defaultValue: false },
    },
    { tableName: "knowledge_base", timestamps: true, underscored: true }
  );
};
