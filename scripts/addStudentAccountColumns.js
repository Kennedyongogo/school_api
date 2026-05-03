/**
 * One-time align: Sequelize Student model expects account_status (+ related cols).
 * sync({ alter: false }) never adds new columns to an existing table — run this once on older DBs.
 *
 * Usage (from school_api): npm run db:add-student-account-columns
 * SQL only: scripts/sql/add_student_account_columns.sql
 */
const fs = require("fs");
const path = require("path");

require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const { sequelize } = require("../src/config/database");

const sqlPath = path.join(__dirname, "sql", "add_student_account_columns.sql");
const SQL = fs.readFileSync(sqlPath, "utf8");

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.query(SQL);
    console.log("✅ students table: account_status columns applied (or already present).");
    await sequelize.close();
    process.exit(0);
  } catch (e) {
    console.error("❌ Migration failed:", e.message || e);
    process.exit(1);
  }
})();
