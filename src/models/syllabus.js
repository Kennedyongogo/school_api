const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Syllabus = sequelize.define(
    "Syllabus",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      class_assignment_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "class_assignments", key: "id" },
      },
      academic_year_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "academic_years", key: "id" },
      },
      semester_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "semesters", key: "id" },
      },
      title: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("draft", "published", "archived"),
        defaultValue: "draft",
      },
      published_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "users", key: "id" },
      },
      published_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "syllabi",
      timestamps: true,
      underscored: true,
    }
  );

  return Syllabus;
};
