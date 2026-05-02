const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Section = sequelize.define(
    "Section",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      name: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      grade_level_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "grade_levels", key: "id" },
      },
      class_teacher_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "teachers", key: "id" },
      },
      room_number: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      capacity: {
        type: DataTypes.INTEGER,
        defaultValue: 40,
      },
      current_enrollment: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      tableName: "sections",
      timestamps: true,
      underscored: true,
      indexes: [{ unique: true, fields: ["grade_level_id", "name"] }],
    }
  );

  return Section;
};
