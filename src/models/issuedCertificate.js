const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "IssuedCertificate",
    {
      id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
      student_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "students", key: "id" },
      },
      template_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "certificate_templates", key: "id" },
      },
      certificate_number: { type: DataTypes.STRING(80), allowNull: false, unique: true },
      issue_date: { type: DataTypes.DATE, allowNull: false },
      expiry_date: { type: DataTypes.DATE, allowNull: true },
      certificate_url: { type: DataTypes.STRING(500), allowNull: true },
      verification_code: { type: DataTypes.STRING(64), allowNull: false },
      is_revoked: { type: DataTypes.BOOLEAN, defaultValue: false },
      revoked_at: { type: DataTypes.DATE, allowNull: true },
      revoked_reason: { type: DataTypes.TEXT, allowNull: true },
    },
    { tableName: "issued_certificates", timestamps: true, underscored: true }
  );
};
