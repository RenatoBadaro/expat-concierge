/**
 * Action log tasks — loaded from docs/V4_Action_Log_Tasks.xlsx (source of truth).
 * Edit the Excel file directly; the server reloads when the file changes.
 * Category: uses "Final Category" when present, otherwise falls back to "Category".
 */

const fs = require("fs");
const path = require("path");
const ExcelJS = require("exceljs");

const DEFAULT_XLSX = path.join(__dirname, "..", "..", "docs", "V4_Action_Log_Tasks.xlsx");

let cache = { mtimeMs: 0, version: "", tasks: [] };

function tasksPath() {
  return process.env.ACTION_LOG_TASKS_XLSX || DEFAULT_XLSX;
}

function cellStr(val) {
  if (val == null) return "";
  if (typeof val === "object" && val.richText) {
    return val.richText.map((r) => r.text).join("");
  }
  return String(val).trim();
}

function parseCondition(raw) {
  const value = cellStr(raw);
  if (!value || /^none$/i.test(value)) return null;
  if (/^untilpredefineddate$/i.test(value)) return null;
  return value;
}

function parseNumber(raw) {
  const n = Number(cellStr(raw));
  return Number.isFinite(n) ? n : null;
}

function buildHeaderMap(ws) {
  const map = {};
  const headerRow = ws.getRow(1);
  headerRow.eachCell((cell, colNumber) => {
    const key = cellStr(cell.value).toLowerCase();
    if (key) map[key] = colNumber;
  });
  return map;
}

function getCellValue(row, colMap, ...names) {
  for (const name of names) {
    const col = colMap[name.toLowerCase()];
    if (col) return row.getCell(col).value;
  }
  return null;
}

function normalizeContactValue(raw) {
  const value = cellStr(raw);
  if (!value) return null;
  const k = value.toLowerCase().replace(/\s+/g, "");
  if (k === "gm" || k === "globalmobility") return "GM";
  if (k === "k2") return "K2";
  if (k === "vialto") return "Vialto";
  if (k === "netexpat") return "Net Expat";
  if (k === "cigna") return "Cigna";
  if (k === "hostpbp") return "Host PBP";
  if (k === "expat") return "Expat";
  return value;
}

async function loadTasks(force = false) {
  const file = tasksPath();
  if (!fs.existsSync(file)) {
    console.warn("[action-log-tasks] Catalog not found:", file);
    cache = { mtimeMs: 0, version: "", tasks: [] };
    return cache.tasks;
  }

  const stat = fs.statSync(file);
  if (!force && stat.mtimeMs === cache.mtimeMs && cache.tasks.length) {
    return cache.tasks;
  }

  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(file);
  const ws = wb.getWorksheet("Action Log Tasks") || wb.worksheets[0];
  const colMap = buildHeaderMap(ws);
  const tasks = [];

  ws.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;

    const id = parseNumber(getCellValue(row, colMap, "id"));
    if (!id) return;

    const status = cellStr(getCellValue(row, colMap, "status")) || "Active";
    if (/^disabled$/i.test(status)) return;

    const order = parseNumber(getCellValue(row, colMap, "order")) ?? id;
    const task = cellStr(getCellValue(row, colMap, "task"));
    if (!task) return;

    const finalCategory = cellStr(getCellValue(row, colMap, "final category"));
    const subCategory = cellStr(
      getCellValue(row, colMap, "sub category", "category")
    );
    const legacyCategory = cellStr(getCellValue(row, colMap, "category"));

    tasks.push({
      id,
      order,
      task,
      cat: finalCategory || subCategory || legacyCategory,
      subCat: subCategory || legacyCategory || null,
      slot: cellStr(getCellValue(row, colMap, "deadline slot")),
      condition: parseCondition(getCellValue(row, colMap, "condition")),
      owner: cellStr(getCellValue(row, colMap, "owner")) || "Expat",
      contact: normalizeContactValue(getCellValue(row, colMap, "contact")),
      suggestion: parseCondition(getCellValue(row, colMap, "suggestion")),
      actionLabel: parseCondition(getCellValue(row, colMap, "action label")),
      actionUrl: parseCondition(getCellValue(row, colMap, "action url")),
      notes: parseCondition(getCellValue(row, colMap, "notes")),
      comments: parseCondition(getCellValue(row, colMap, "comments")),
      status,
    });
  });

  tasks.sort((a, b) => a.order - b.order);

  cache = {
    mtimeMs: stat.mtimeMs,
    version: stat.mtime.toISOString(),
    tasks,
  };
  console.log(`[action-log-tasks] Loaded ${tasks.length} tasks from ${path.basename(file)}`);
  return tasks;
}

function invalidateCache() {
  cache.mtimeMs = 0;
}

module.exports = {
  loadTasks,
  invalidateCache,
  tasksPath,
};
