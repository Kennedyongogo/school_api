const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const AcademicYear = sequelize.define(
    "AcademicYear",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      name: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      start_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      end_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      is_current: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      status: {
        type: DataTypes.ENUM("upcoming", "active", "completed", "archived"),
        defaultValue: "upcoming",
      },
    },
    {
      tableName: "academic_years",
      timestamps: true,
      underscored: true,
    }
  );

  return AcademicYear;
};
