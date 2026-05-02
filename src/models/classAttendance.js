const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ClassAttendance = sequelize.define(
    "ClassAttendance",
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
      check_in_time: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      check_out_time: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("present", "absent", "late", "excused"),
        defaultValue: "absent",
      },
      lateness_minutes: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      participation_score: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      teacher_remarks: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      auto_marked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: "class_attendances",
      timestamps: true,
      underscored: true,
      indexes: [{ unique: true, fields: ["class_session_id", "student_id"] }],
    }
  );

  return ClassAttendance;
};
