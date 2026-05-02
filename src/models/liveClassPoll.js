const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "LiveClassPoll",
    {
      id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
      live_class_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "live_classes", key: "id" },
      },
      question: { type: DataTypes.TEXT, allowNull: false },
      options: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
      created_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "users", key: "id" },
      },
      expires_at: { type: DataTypes.DATE, allowNull: true },
    },
    { tableName: "live_class_polls", timestamps: true, underscored: true }
  );
};
