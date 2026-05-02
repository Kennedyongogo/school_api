const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const GradeLevel = sequelize.define(
    "GradeLevel",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      level_number: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      minimum_age: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      maximum_age: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      order_sequence: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: "grade_levels",
      timestamps: true,
      underscored: true,
    }
  );

  return GradeLevel;
};
