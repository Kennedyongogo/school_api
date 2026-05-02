const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Program = sequelize.define(
    "Program",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      curriculum_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "curricula", key: "id" },
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      grade_level_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "grade_levels", key: "id" },
      },
      duration: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      requirements: {
        type: DataTypes.JSONB,
        defaultValue: [],
      },
      career_paths: {
        type: DataTypes.JSONB,
        defaultValue: [],
      },
      fee_structure_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "fee_structures", key: "id" },
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: "programs",
      timestamps: true,
      underscored: true,
    }
  );

  return Program;
};
