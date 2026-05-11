const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const GradingAssignment = sequelize.define(
    "GradingAssignment",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      scope_type: {
        type: DataTypes.ENUM(
          "curriculum",
          "curriculum_class",
          "curriculum_class_level",
          "curriculum_subject"
        ),
        allowNull: false,
      },
      curriculum_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "curricula", key: "id" },
      },
      curriculum_class_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "curriculum_classes", key: "id" },
      },
      curriculum_class_level_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "curriculum_class_levels", key: "id" },
      },
      curriculum_subject_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "curriculum_subjects", key: "id" },
      },
      grading_system_type: {
        type: DataTypes.ENUM(
          "american",
          "british",
          "ib",
          "percentage",
          "gpa",
          "cambridge"
        ),
        allowNull: false,
        defaultValue: "percentage",
      },
      effective_from: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      effective_to: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      created_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "users", key: "id" },
      },
      updated_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "users", key: "id" },
      },
    },
    {
      tableName: "grading_assignments",
      timestamps: true,
      underscored: true,
      indexes: [
        { fields: ["scope_type", "is_active"], name: "grading_assignments_scope_active_idx" },
        { fields: ["curriculum_id"], name: "grading_assignments_curriculum_idx" },
        { fields: ["curriculum_class_id"], name: "grading_assignments_class_idx" },
        { fields: ["curriculum_class_level_id"], name: "grading_assignments_level_idx" },
        { fields: ["curriculum_subject_id"], name: "grading_assignments_subject_idx" },
      ],
    }
  );

  return GradingAssignment;
};
