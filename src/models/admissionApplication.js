const { DataTypes } = require("sequelize");
const {
  ADMISSION_STATUSES,
  DEFAULT_ADMISSION_STATUS,
} = require("../constants/admissionStatuses");

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
        type: DataTypes.STRING(20),
        allowNull: true,
        unique: true,
      },
      status: {
        type: DataTypes.ENUM(...ADMISSION_STATUSES),
        allowNull: false,
        defaultValue: DEFAULT_ADMISSION_STATUS,
      },
      curriculum_level: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      curriculum_class: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      curriculum: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      applicant_name: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      applicant_phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      applicant_email: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      student_name: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      student_picture: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      student_reportcard: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      student_birthcertificate: {
        type: DataTypes.STRING(255),
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