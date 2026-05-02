const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "SupportTicket",
    {
      id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
      },
      category: {
        type: DataTypes.ENUM("technical", "billing", "academic", "general"),
        defaultValue: "general",
      },
      priority: {
        type: DataTypes.ENUM("low", "medium", "high", "urgent"),
        defaultValue: "medium",
      },
      subject: { type: DataTypes.STRING(200), allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: false },
      status: {
        type: DataTypes.ENUM("open", "in_progress", "resolved", "closed"),
        defaultValue: "open",
      },
      assigned_to: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "users", key: "id" },
      },
      resolved_at: { type: DataTypes.DATE, allowNull: true },
      satisfaction_rating: { type: DataTypes.INTEGER, allowNull: true },
    },
    { tableName: "support_tickets", timestamps: true, underscored: true }
  );
};
