const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ExamQuestion = sequelize.define(
    "ExamQuestion",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      exam_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "exams", key: "id" },
      },
      question_text: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      question_type: {
        type: DataTypes.ENUM("multiple_choice", "true_false", "essay"),
        allowNull: false,
      },
      options: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      correct_answer: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      marks: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      order_number: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      explanation: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "exam_questions",
      timestamps: true,
      underscored: true,
    }
  );

  return ExamQuestion;
};
