const { sequelize } = require("../config/database");

const User = require("./user")(sequelize);
const Teacher = require("./teacher")(sequelize);
const Student = require("./student")(sequelize);
const Parent = require("./parent")(sequelize);
const StudentParent = require("./studentParent")(sequelize);
const SchoolAdmin = require("./schoolAdmin")(sequelize);

const models = {
  User,
  Teacher,
  Student,
  Parent,
  StudentParent,
  SchoolAdmin,
};

const initializeModels = async () => {
  try {
    console.log("🔄 Creating/updating school system tables...");
    await User.sync({ force: false, alter: false });
    await Teacher.sync({ force: false, alter: false });
    await Student.sync({ force: false, alter: false });
    await Parent.sync({ force: false, alter: false });
    await StudentParent.sync({ force: false, alter: false });
    await SchoolAdmin.sync({ force: false, alter: false });
    console.log("✅ All models synced successfully");
  } catch (error) {
    console.error("❌ Error syncing models:", error);
    throw error;
  }
};

const setupAssociations = () => {
  try {
    User.hasOne(Student, { foreignKey: "user_id", onDelete: "CASCADE", as: "student_profile" });
    Student.belongsTo(User, { foreignKey: "user_id", as: "user" });

    User.hasOne(Teacher, { foreignKey: "user_id", onDelete: "CASCADE", as: "teacher_profile" });
    Teacher.belongsTo(User, { foreignKey: "user_id", as: "user" });

    User.hasOne(Parent, { foreignKey: "user_id", onDelete: "CASCADE", as: "parent_profile" });
    Parent.belongsTo(User, { foreignKey: "user_id", as: "user" });

    User.hasOne(SchoolAdmin, {
      foreignKey: "user_id",
      onDelete: "CASCADE",
      as: "school_admin_profile",
    });
    SchoolAdmin.belongsTo(User, { foreignKey: "user_id", as: "user" });

    Student.belongsToMany(Parent, {
      through: StudentParent,
      foreignKey: "student_id",
      otherKey: "parent_id",
      as: "parents",
    });
    Parent.belongsToMany(Student, {
      through: StudentParent,
      foreignKey: "parent_id",
      otherKey: "student_id",
      as: "students",
    });

    Teacher.hasMany(Student, { foreignKey: "class_teacher_id", as: "class_students" });
    Student.belongsTo(Teacher, { foreignKey: "class_teacher_id", as: "class_teacher" });

    console.log("✅ All associations set up successfully");
  } catch (error) {
    console.error("❌ Error during setupAssociations:", error);
    throw error;
  }
};

module.exports = { ...models, initializeModels, setupAssociations, sequelize };
