const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "TicketReply",
    {
      id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
      ticket_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "support_tickets", key: "id" },
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
      },
      message: { type: DataTypes.TEXT, allowNull: false },
      attachments: { type: DataTypes.JSONB, defaultValue: [] },
      is_internal: { type: DataTypes.BOOLEAN, defaultValue: false },
    },
    { tableName: "ticket_replies", timestamps: true, underscored: true }
  );
};
