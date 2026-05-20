/**
 * Drops exam data and applies unified exam schema (scheduling on exams table).
 * Usage: node scripts/run-exam-unified-migration.js
 */
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { sequelize } = require("../src/config/database");

async function main() {
  const sqlPath = path.join(__dirname, "..", "migrations", "20260525_unified_exam_schedule.sql");
  const raw = fs.readFileSync(sqlPath, "utf8");
  const statements = raw
    .split(";")
    .map((s) => s.replace(/--[^\n]*/g, "").trim())
    .filter((s) => s.length > 0 && !/^BEGIN$/i.test(s) && !/^COMMIT$/i.test(s));

  console.log("Running unified exam migration...");
  for (const stmt of statements) {
    await sequelize.query(stmt);
  }
  console.log("Done. Restart the API server.");
  await sequelize.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
