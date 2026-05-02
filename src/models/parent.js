const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Parent = sequelize.define(
    "Parent",
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
      occupation: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      relationship: {
        type: DataTypes.ENUM("father", "mother", "guardian", "other"),
        allowNull: false,
      },
      emergency_contact: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      newsletter_subscription: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: "parents",
      timestamps: true,
      underscored: true,
    }
  );

  return Parent;
};
