const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ReportCardItem = sequelize.define(
    "ReportCardItem",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      report_card_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "report_cards", key: "id" },
      },
      subject_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "subjects", key: "id" },
      },
      exam_score: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },
      quiz_score: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },
      assignment_score: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },
      project_score: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },
      participation_score: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },
      final_score: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
      },
      percentage: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
      },
      grade: {
        type: DataTypes.STRING(5),
        allowNull: false,
      },
      gpa: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: true,
      },
      teacher_remarks: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      class_average: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },
      highest_score: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },
      lowest_score: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },
    },
    {
      tableName: "report_card_items",
      timestamps: true,
      underscored: true,
      indexes: [{ unique: true, fields: ["report_card_id", "subject_id"] }],
    }
  );

  return ReportCardItem;
};
