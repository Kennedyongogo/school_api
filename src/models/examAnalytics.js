const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "ExamAnalytics",
    {
      id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
      exam_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "exams", key: "id" },
      },
      average_score: { type: DataTypes.DECIMAL(8, 2), allowNull: true },
      pass_rate: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
      highest_score: { type: DataTypes.DECIMAL(8, 2), allowNull: true },
      lowest_score: { type: DataTypes.DECIMAL(8, 2), allowNull: true },
      average_completion_time: { type: DataTypes.INTEGER, allowNull: true },
      proctoring_violations: { type: DataTypes.INTEGER, defaultValue: 0 },
      students_flagged: { type: DataTypes.INTEGER, defaultValue: 0 },
    },
    {
      tableName: "exam_analytics",
      timestamps: true,
      underscored: true,
      indexes: [{ unique: true, fields: ["exam_id"] }],
    }
  );
};
