const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "StudentEngagement",
    {
      id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
      student_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "students", key: "id" },
      },
      date: { type: DataTypes.DATEONLY, allowNull: false },
      total_time_minutes: { type: DataTypes.INTEGER, defaultValue: 0 },
      classes_attended: { type: DataTypes.INTEGER, defaultValue: 0 },
      assignments_submitted: { type: DataTypes.INTEGER, defaultValue: 0 },
      discussion_posts: { type: DataTypes.INTEGER, defaultValue: 0 },
      login_count: { type: DataTypes.INTEGER, defaultValue: 0 },
      last_activity_at: { type: DataTypes.DATE, allowNull: true },
    },
    {
      tableName: "student_engagements",
      timestamps: true,
      underscored: true,
      indexes: [{ unique: true, fields: ["student_id", "date"] }],
    }
  );
};
