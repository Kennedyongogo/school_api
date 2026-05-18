const fs = require("fs");
const path = require("path");

const INDEX = path.join(__dirname, "../src/models/index.js");
const REMOVE = new Set(require("./prune-index-models.js").REMOVE);

function usesRemoved(text) {
  for (const name of REMOVE) {
    if (new RegExp(`\\b${name}\\b`).test(text)) return true;
  }
  return false;
}

let src = fs.readFileSync(INDEX, "utf8");

// Drop CurriculumSubjectGradingBand require (multiline missed)
src = src.replace(/\nconst CurriculumSubjectGradingBand[\s\S]*?\(sequelize,\n\);\n/, "\n");
src = src.replace(/\n  CurriculumSubjectGradingBand,\n/, "\n");
src = src.replace(/\n    await CurriculumSubjectGradingBand\.sync[^\n]+\n/, "\n");

const start = src.indexOf("const setupAssociations = () => {");
const endMark = "\n};\n\nmodule.exports";
const end = src.indexOf(endMark, start);
const before = src.slice(0, start);
const after = src.slice(end);
const bodyLines = src.slice(start, end).split("\n");

const out = [];
let skip = false;
let depth = 0;
let stmt = [];

for (const line of bodyLines) {
  if (line.includes("const setupAssociations")) {
    out.push(line);
    continue;
  }
  const isStmtStart = /^\s{4}\w+\.(hasMany|belongsTo|hasOne|belongsToMany)\(/.test(line);
  if (isStmtStart) {
    if (stmt.length) {
      if (!skip) out.push(...stmt);
      stmt = [];
    }
    skip = usesRemoved(line);
    stmt.push(line);
    depth = (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
    if (depth <= 0 && line.trim().endsWith(");")) {
      if (!skip) out.push(...stmt);
      stmt = [];
      skip = false;
      depth = 0;
    }
    continue;
  }
  if (stmt.length) {
    stmt.push(line);
    depth += (line.match(/\{/g) || []).length;
    depth -= (line.match(/\}/g) || []).length;
    if (depth <= 0 && line.trim().endsWith(");")) {
      if (!skip) out.push(...stmt);
      stmt = [];
      skip = false;
      depth = 0;
    }
    continue;
  }
  if (!usesRemoved(line)) out.push(line);
}

const newSrc = before + out.join("\n") + after;
fs.writeFileSync(INDEX, newSrc.replace(/\n{4,}/g, "\n\n\n"));
console.log("Associations pruned");
