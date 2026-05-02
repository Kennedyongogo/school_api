const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const RealTimeActivity = sequelize.define(
    "RealTimeActivity",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      student_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "students", key: "id" },
      },
      session_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      session_type: {
        type: DataTypes.ENUM("exam", "class", "study"),
        allowNull: false,
      },
      activity_type: {
        type: DataTypes.ENUM(
          "heartbeat",
          "answer_changed",
          "question_navigated",
          "page_view",
          "mouse_move",
          "click",
          "keypress",
          "tab_switch",
          "window_blur",
          "window_focus",
          "copy_attempt",
          "paste_attempt",
          "right_click",
          "screenshot_taken",
          "exam_paused",
          "exam_resumed",
          "student_inactive",
          "student_active"
        ),
        allowNull: false,
      },
      activity_data: {
        type: DataTypes.JSONB,
        defaultValue: {},
      },
      timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      is_flagged: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      flag_reason: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      tableName: "real_time_activities",
      timestamps: true,
      underscored: true,
      indexes: [
        { fields: ["student_id", "session_id", "timestamp"] },
        { fields: ["session_id", "activity_type"] },
      ],
    }
  );

  return RealTimeActivity;
};
