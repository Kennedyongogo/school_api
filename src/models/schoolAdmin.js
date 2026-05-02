const { DataTypes } = require("sequelize");

/** Maps to table `admins` — Sequelize model name SchoolAdmin to avoid confusion with application “admin” role. */
module.exports = (sequelize) => {
  const SchoolAdmin = sequelize.define(
    "SchoolAdmin",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
      },
      employee_number: {
        type: DataTypes.STRING(20),
        unique: true,
        allowNull: false,
      },
      admin_type: {
        type: DataTypes.ENUM(
          "super_admin",
          "principal",
          "vice_principal",
          "accountant",
          "librarian",
          "admin_staff"
        ),
        allowNull: false,
      },
      permissions: {
        type: DataTypes.JSONB,
        defaultValue: {},
      },
      department: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      joining_date: {
        type: DataTypes.DATEONLY,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "admins",
      timestamps: true,
      underscored: true,
    }
  );

  return SchoolAdmin;
};
