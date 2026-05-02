const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Enrollment = sequelize.define(
    "Enrollment",
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
      section_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "sections", key: "id" },
      },
      academic_year: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      enrollment_date: {
        type: DataTypes.DATEONLY,
        defaultValue: DataTypes.NOW,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: "enrollments",
      timestamps: true,
      underscored: true,
      indexes: [{ unique: true, fields: ["student_id", "section_id", "academic_year"] }],
    }
  );

  return Enrollment;
};
