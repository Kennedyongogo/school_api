const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const TemporaryAnswer = sequelize.define(
    "TemporaryAnswer",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      exam_attempt_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "exam_attempts", key: "id" },
      },
      question_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "exam_questions", key: "id" },
      },
      answer_data: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      last_saved_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      auto_save_count: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },
    },
    {
      tableName: "temporary_answers",
      timestamps: true,
      underscored: true,
      indexes: [{ unique: true, fields: ["exam_attempt_id", "question_id"] }],
    }
  );

  return TemporaryAnswer;
};
