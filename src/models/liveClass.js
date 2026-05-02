const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "LiveClass",
    {
      id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
      class_session_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "class_sessions", key: "id" },
      },
      meeting_id: { type: DataTypes.STRING(120), allowNull: false },
      platform: {
        type: DataTypes.ENUM("zoom", "google_meet", "teams", "other"),
        allowNull: false,
        defaultValue: "zoom",
      },
      teacher_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "teachers", key: "id" },
      },
      start_time: { type: DataTypes.DATE, allowNull: false },
      end_time: { type: DataTypes.DATE, allowNull: false },
      recording_url: { type: DataTypes.STRING(500), allowNull: true },
      chat_transcript_url: { type: DataTypes.STRING(500), allowNull: true },
      attendance_count: { type: DataTypes.INTEGER, defaultValue: 0 },
    },
    { tableName: "live_classes", timestamps: true, underscored: true }
  );
};
