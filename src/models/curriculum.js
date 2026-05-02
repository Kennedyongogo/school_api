const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Curriculum = sequelize.define(
    "Curriculum",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      code: {
        type: DataTypes.STRING(20),
        unique: true,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM(
          "cambridge",
          "ib",
          "american",
          "british",
          "national",
          "montessori",
          "other"
        ),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      grade_levels: {
        type: DataTypes.JSONB,
        defaultValue: [],
      },
      subjects: {
        type: DataTypes.JSONB,
        defaultValue: [],
      },
      duration_years: {
        type: DataTypes.INTEGER,
        defaultValue: 12,
      },
      features: {
        type: DataTypes.JSONB,
        defaultValue: [],
      },
      image_url: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      brochure_url: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      display_order: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      tableName: "curricula",
      timestamps: true,
      underscored: true,
    }
  );

  return Curriculum;
};
