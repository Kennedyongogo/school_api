const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const OnlineSessionTracking = sequelize.define(
    "OnlineSessionTracking",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      class_session_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "class_sessions", key: "id" },
      },
      student_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "students", key: "id" },
      },
      joined_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      left_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      total_duration_seconds: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      connection_quality: {
        type: DataTypes.ENUM("excellent", "good", "fair", "poor"),
        allowNull: true,
      },
      interruptions_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      last_active_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      is_connected: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: "online_session_trackings",
      timestamps: true,
      underscored: true,
      indexes: [{ fields: ["class_session_id", "student_id"] }],
    }
  );

  return OnlineSessionTracking;
};
