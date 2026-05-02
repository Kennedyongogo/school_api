const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ExamSchedule = sequelize.define(
    "ExamSchedule",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      exam_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "exams", key: "id" },
      },
      section_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "sections", key: "id" },
      },
      start_time: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      end_time: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      room_number: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      invigilator_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "teachers", key: "id" },
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: "exam_schedules",
      timestamps: true,
      underscored: true,
    }
  );

  return ExamSchedule;
};
