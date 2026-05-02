const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "LiveClassPollResponse",
    {
      id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
      poll_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "live_class_polls", key: "id" },
      },
      student_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "students", key: "id" },
      },
      selected_option: { type: DataTypes.STRING(200), allowNull: false },
      responded_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      tableName: "live_class_poll_responses",
      timestamps: true,
      underscored: true,
      indexes: [{ unique: true, fields: ["poll_id", "student_id"] }],
    }
  );
};
