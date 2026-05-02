const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "CertificateVerification",
    {
      id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
      certificate_number: { type: DataTypes.STRING(80), allowNull: false },
      verification_code: { type: DataTypes.STRING(64), allowNull: false },
      verified_at: { type: DataTypes.DATE, allowNull: false },
      verifier_ip: { type: DataTypes.STRING(45), allowNull: true },
      is_valid: { type: DataTypes.BOOLEAN, allowNull: false },
    },
    { tableName: "certificate_verifications", timestamps: true, underscored: true }
  );
};
