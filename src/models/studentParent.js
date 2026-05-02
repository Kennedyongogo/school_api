const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const StudentParent = sequelize.define(
    "StudentParent",
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
      parent_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "parents", key: "id" },
      },
      is_primary_contact: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: "student_parents",
      timestamps: true,
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ["student_id", "parent_id"],
        },
      ],
    }
  );

  return StudentParent;
};
