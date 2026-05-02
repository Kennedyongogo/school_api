const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const StudentInstallmentPlan = sequelize.define(
    "StudentInstallmentPlan",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      student_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "students", key: "id" },
      },
      academic_year_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "academic_years", key: "id" },
      },
      term_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "academic_terms", key: "id" },
      },
      installment_plan_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "installment_plans", key: "id" },
      },
      total_term_fees: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      selected_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: "student_installment_plans",
      timestamps: true,
      underscored: true,
      indexes: [{ unique: true, fields: ["student_id", "academic_year_id", "term_id"] }],
    }
  );

  return StudentInstallmentPlan;
};
