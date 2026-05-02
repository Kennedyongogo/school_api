const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Subject = sequelize.define(
    "Subject",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      code: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
      },
      department_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "departments", key: "id" },
      },
      credit_hours: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },
      is_elective: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      passing_mark: {
        type: DataTypes.INTEGER,
        defaultValue: 40,
      },
      full_mark: {
        type: DataTypes.INTEGER,
        defaultValue: 100,
      },
    },
    {
      tableName: "subjects",
      timestamps: true,
      underscored: true,
    }
  );

  return Subject;
};
