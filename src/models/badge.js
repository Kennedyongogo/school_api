const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "Badge",
    {
      id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
      name: { type: DataTypes.STRING(120), allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: true },
      icon_url: { type: DataTypes.STRING(500), allowNull: true },
      criteria: { type: DataTypes.TEXT, allowNull: true },
      points: { type: DataTypes.INTEGER, defaultValue: 0 },
      category: {
        type: DataTypes.ENUM("academic", "sports", "arts", "leadership", "attendance"),
        defaultValue: "academic",
      },
    },
    { tableName: "badges", timestamps: true, underscored: true }
  );
};
