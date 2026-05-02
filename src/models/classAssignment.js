const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ClassAssignment = sequelize.define(
    "ClassAssignment",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      section_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "sections", key: "id" },
      },
      subject_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "subjects", key: "id" },
      },
      teacher_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "teachers", key: "id" },
      },
      academic_year: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      schedule: {
        type: DataTypes.JSONB,
        defaultValue: [],
      },
      room_number: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
    },
    {
      tableName: "class_assignments",
      timestamps: true,
      underscored: true,
      indexes: [{ unique: true, fields: ["section_id", "subject_id", "academic_year"] }],
    }
  );

  return ClassAssignment;
};
