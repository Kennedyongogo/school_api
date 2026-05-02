const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Semester = sequelize.define(
    "Semester",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      academic_year_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "academic_years", key: "id" },
      },
      name: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      term_number: {
        type: DataTypes.INTEGER,
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
      weight_percentage: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 33.33,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: "semesters",
      timestamps: true,
      underscored: true,
      indexes: [{ unique: true, fields: ["academic_year_id", "term_number"] }],
    }
  );

  return Semester;
};
