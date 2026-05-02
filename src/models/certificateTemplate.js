const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "CertificateTemplate",
    {
      id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
      name: { type: DataTypes.STRING(150), allowNull: false },
      type: {
        type: DataTypes.ENUM("course", "grade", "attendance", "achievement"),
        allowNull: false,
      },
      template_html: { type: DataTypes.TEXT, allowNull: true },
      template_css: { type: DataTypes.TEXT, allowNull: true },
      background_image: { type: DataTypes.STRING(500), allowNull: true },
      signature_image: { type: DataTypes.STRING(500), allowNull: true },
      seal_image: { type: DataTypes.STRING(500), allowNull: true },
      fields: { type: DataTypes.JSONB, defaultValue: {} },
    },
    { tableName: "certificate_templates", timestamps: true, underscored: true }
  );
};
