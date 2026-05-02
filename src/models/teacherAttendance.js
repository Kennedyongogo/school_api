const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const TeacherAttendance = sequelize.define(
    "TeacherAttendance",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      teacher_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "teachers", key: "id" },
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      check_in_time: {
        type: DataTypes.TIME,
        allowNull: true,
      },
      check_out_time: {
        type: DataTypes.TIME,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("present", "absent", "late", "half_day", "on_leave"),
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
      leave_type: {
        type: DataTypes.ENUM("sick", "annual", "emergency", "training"),
        allowNull: true,
      },
      leave_reason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      approved_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "users", key: "id" },
      },
      remarks: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "teacher_attendances",
      timestamps: true,
      underscored: true,
      indexes: [{ unique: true, fields: ["teacher_id", "date"] }],
    }
  );

  return TeacherAttendance;
};
