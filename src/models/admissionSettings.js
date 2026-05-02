const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const AdmissionSettings = sequelize.define(
    "AdmissionSettings",
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
      application_start_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      application_end_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      application_fee: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
      },
      max_applications: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      auto_approve_enrollment: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      welcome_email_template: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      is_open: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: "admission_settings",
      timestamps: true,
      underscored: true,
    }
  );

  return AdmissionSettings;
};
