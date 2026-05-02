const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "EarnedBadge",
    {
      id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
      badge_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "badges", key: "id" },
      },
      student_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "students", key: "id" },
      },
      earned_at: { type: DataTypes.DATE, allowNull: false },
      awarded_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "users", key: "id" },
      },
      evidence_url: { type: DataTypes.STRING(500), allowNull: true },
      is_displayed: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    {
      tableName: "earned_badges",
      timestamps: true,
      underscored: true,
      indexes: [{ unique: true, fields: ["badge_id", "student_id"] }],
    }
  );
};
