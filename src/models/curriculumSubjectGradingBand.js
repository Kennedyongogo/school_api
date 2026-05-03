const { DataTypes } = require("sequelize");

/**
 * Per curriculum-subject grading ladder (e.g. IGCSE A*-G, CBC exceeding/meeting, 8-4-4 letter bands).
 * Use percentage bands and/or raw score bands depending on assessment style.
 */
module.exports = (sequelize) => {
  const CurriculumSubjectGradingBand = sequelize.define(
    "CurriculumSubjectGradingBand",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      curriculum_subject_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "curriculum_subjects", key: "id" },
        onDelete: "CASCADE",
      },
      label: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      short_code: {
        type: DataTypes.STRING(25),
        allowNull: true,
      },
      min_percentage: {
        type: DataTypes.DECIMAL(6, 2),
        allowNull: true,
      },
      max_percentage: {
        type: DataTypes.DECIMAL(6, 2),
        allowNull: true,
      },
      min_raw_score: {
        type: DataTypes.DECIMAL(12, 4),
        allowNull: true,
      },
      max_raw_score: {
        type: DataTypes.DECIMAL(12, 4),
        allowNull: true,
      },
      gpa_points: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },
      weight: {
        type: DataTypes.DECIMAL(8, 4),
        allowNull: true,
      },
      narrative: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      order_index: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      is_passing_grade: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: "curriculum_subject_grading_bands",
      timestamps: true,
      underscored: true,
      indexes: [{ fields: ["curriculum_subject_id"], name: "curriculum_subject_grading_bands_subject_idx" }],
    }
  );

  return CurriculumSubjectGradingBand;
};
