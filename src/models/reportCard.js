const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ReportCard = sequelize.define(
    "ReportCard",
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
      semester_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "semesters", key: "id" },
      },
      academic_year_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "academic_years", key: "id" },
      },
      report_url: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      generated_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      is_published: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      published_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      pdf_data: {
        type: DataTypes.BLOB,
        allowNull: true,
      },
      teacher_comments: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      principal_signature: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      tableName: "report_cards",
      timestamps: true,
      underscored: true,
      indexes: [{ unique: true, fields: ["student_id", "semester_id"] }],
    }
  );

  return ReportCard;
};
