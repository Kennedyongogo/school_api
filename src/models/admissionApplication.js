const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const AdmissionApplication = sequelize.define(
    "AdmissionApplication",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      application_number: {
        type: DataTypes.STRING(50),
        unique: true,
        allowNull: false,
      },
      student_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      date_of_birth: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      gender: {
        type: DataTypes.ENUM("male", "female", "other"),
        allowNull: false,
      },
      applying_for_grade: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      curriculum_preference: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      academic_year_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "academic_years", key: "id" },
      },
      father_name: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      father_phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      father_email: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      mother_name: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      mother_phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      mother_email: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      guardian_name: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      guardian_phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      guardian_email: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      previous_school: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      previous_grade: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      last_exam_score: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      birth_certificate_url: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      report_card_url: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      passport_photo_url: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      transfer_certificate_url: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM(
          "pending",
          "reviewing",
          "assessment_scheduled",
          "assessment_completed",
          "accepted",
          "rejected",
          "waitlisted",
          "enrolled"
        ),
        defaultValue: "pending",
      },
      assessment_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      assessment_notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      assessment_score: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      fee_waiver_requested: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      fee_waiver_reason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      remarks: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      processed_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "users", key: "id" },
      },
      processed_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "admission_applications",
      timestamps: true,
      underscored: true,
    }
  );

  return AdmissionApplication;
};
