const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "SystemSetting",
    {
      id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
      key: { type: DataTypes.STRING(120), allowNull: false, unique: true },
      value: { type: DataTypes.TEXT, allowNull: true },
      type: {
        type: DataTypes.ENUM("string", "number", "boolean", "json"),
        defaultValue: "string",
      },
      category: {
        type: DataTypes.ENUM("general", "email", "payment", "proctoring", "grading"),
        defaultValue: "general",
      },
      is_encrypted: { type: DataTypes.BOOLEAN, defaultValue: false },
      description: { type: DataTypes.TEXT, allowNull: true },
    },
    { tableName: "system_settings", timestamps: true, underscored: true }
  );
};
