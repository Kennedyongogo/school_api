const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const SchoolEvent = sequelize.define(
    "SchoolEvent",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      title: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      slug: {
        type: DataTypes.STRING(200),
        unique: true,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      event_type: {
        type: DataTypes.ENUM(
          "sports",
          "academic",
          "cultural",
          "parent_meeting",
          "admission",
          "holiday",
          "workshop",
          "competition",
          "other"
        ),
        allowNull: false,
      },
      start_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      end_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      location: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      meeting_link: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      poster_image: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      poster_prompt: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      poster_color_palette: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      registration_required: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      registration_deadline: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      max_attendees: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      fee_amount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
      },
      created_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "users", key: "id" },
      },
      is_published: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      is_featured: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      tags: {
        type: DataTypes.JSONB,
        defaultValue: [],
      },
    },
    {
      tableName: "events",
      timestamps: true,
      underscored: true,
    }
  );

  return SchoolEvent;
};
