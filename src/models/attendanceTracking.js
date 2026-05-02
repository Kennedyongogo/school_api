const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const AttendanceTracking = sequelize.define(
    "AttendanceTracking",
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
      class_assignment_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "class_assignments", key: "id" },
      },
      session_type: {
        type: DataTypes.ENUM("class", "exam", "study_hall"),
        allowNull: false,
      },
      session_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      check_in_time: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      check_out_time: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      total_duration_seconds: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      status: {
        type: DataTypes.ENUM("present", "absent", "late", "left_early", "in_progress"),
        defaultValue: "present",
      },
      lateness_minutes: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      early_departure_minutes: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      ip_address: {
        type: DataTypes.STRING(45),
        allowNull: true,
      },
      device_info: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
    },
    {
      tableName: "attendance_trackings",
      timestamps: true,
      underscored: true,
      indexes: [{ fields: ["student_id", "session_type", "session_id"] }],
    }
  );

  return AttendanceTracking;
};
