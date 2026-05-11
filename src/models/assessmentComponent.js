const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const AssessmentComponent = sequelize.define(
    "AssessmentComponent",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
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
      semester_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "semesters", key: "id" },
      },
      component_type: {
        type: DataTypes.ENUM(
          "ca",
          "quiz",
          "assignment",
          "project",
          "midterm",
          "endterm",
          "practical",
          "oral",
          "custom"
        ),
        allowNull: false,
      },
      component_label: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      calculation_method: {
        type: DataTypes.ENUM("average", "best", "latest", "sum"),
        allowNull: false,
        defaultValue: "average",
      },
      weight_percent: {
        type: DataTypes.DECIMAL(6, 2),
        allowNull: false,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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
      tableName: "assessment_components",
      timestamps: true,
      underscored: true,
      indexes: [
        { fields: ["is_active", "component_type"], name: "assessment_components_active_type_idx" },
        { fields: ["curriculum_id"], name: "assessment_components_curriculum_idx" },
        { fields: ["curriculum_class_id"], name: "assessment_components_class_idx" },
        { fields: ["curriculum_class_level_id"], name: "assessment_components_level_idx" },
        { fields: ["curriculum_subject_id"], name: "assessment_components_subject_idx" },
        { fields: ["semester_id"], name: "assessment_components_semester_idx" },
      ],
    }
  );

  return AssessmentComponent;
};
