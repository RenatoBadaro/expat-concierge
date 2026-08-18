/**
 * Offline Q&A catalog — loaded from docs/V4_Offline_QA_Catalog.xlsx (source of truth).
 * Edit the Excel file directly; the server reloads when the file changes.
 */

const fs = require("fs");
const path = require("path");
const ExcelJS = require("exceljs");

const DEFAULT_XLSX = path.join(__dirname, "..", "..", "docs", "V4_Offline_QA_Catalog.xlsx");

let cache = { mtimeMs: 0, rows: [] };

function catalogPath() {
  return process.env.OFFLINE_QA_XLSX || DEFAULT_XLSX;
}

function cellStr(val) {
  if (val == null) return "";
  if (typeof val === "object" && val.richText) {
    return val.richText.map((r) => r.text).join("");
  }
  return String(val).trim();
}

async function loadCatalog(force = false) {
  const file = catalogPath();
  if (!fs.existsSync(file)) {
    console.warn("[offline-qa] Catalog not found:", file);
    cache = { mtimeMs: 0, rows: [] };
    return cache.rows;
  }

  const stat = fs.statSync(file);
  if (!force && stat.mtimeMs === cache.mtimeMs && cache.rows.length) {
    return cache.rows;
  }

  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(file);
  const ws = wb.getWorksheet("Offline Q&A V4") || wb.worksheets[0];
  const rows = [];

  ws.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const id = cellStr(row.getCell(1).value);
    if (!id) return;

    const validationStatus = cellStr(row.getCell(13).value) || "To review";
    if (/^disabled$/i.test(validationStatus)) return;

    rows.push({
      id,
      topic: cellStr(row.getCell(2).value),
      keywords: cellStr(row.getCell(3).value),
      sampleQuestion: cellStr(row.getCell(4).value),
      userId: cellStr(row.getCell(5).value) || null,
      profile: cellStr(row.getCell(6).value),
      assignmentType: cellStr(row.getCell(7).value) || null,
      hostCountry: cellStr(row.getCell(8).value) || null,
      fullResponse: cellStr(row.getCell(9).value),
      followUp1: cellStr(row.getCell(10).value),
      followUp2: cellStr(row.getCell(11).value),
      followUp3: cellStr(row.getCell(12).value),
      validationStatus,
      notes: cellStr(row.getCell(14).value),
    });
  });

  cache = { mtimeMs: stat.mtimeMs, rows };
  console.log(`[offline-qa] Loaded ${rows.length} rows from ${path.basename(file)}`);
  return rows;
}

function isFallbackRow(row) {
  return /fallback/i.test(row.topic) || /any other question/i.test(row.keywords);
}

function hasWord(q, word) {
  return new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(q);
}

function matchesKeywordOption(q, opt) {
  const token = opt.trim().toLowerCase();
  if (!token) return false;
  if (token === "pet" || token === "dog" || token === "cat") {
    return hasWord(q, token);
  }
  return q.includes(token);
}

/**
 * Keyword syntax in Excel (column C):
 *   - ` + ` separates AND groups (all groups must match)
 *   - `/` or `,` inside a group = OR (any option matches)
 * Example: "need more/what if/top up + housing/rent"
 */
function matchesKeywords(q, raw) {
  const text = (raw || "").trim();
  if (!text || isFallbackRow({ keywords: text, topic: "" })) return false;

  const groups = text.split("+").map((g) => g.trim()).filter(Boolean);
  return groups.every((group) => {
    const options = group.split(/[/,]/).map((s) => s.trim()).filter(Boolean);
    return options.some((opt) => matchesKeywordOption(q, opt));
  });
}

function matchesGreeting(q) {
  return /^(hi|hello|hey|ola|olá)[!.?\s]*$/i.test(q.trim());
}

function rowScore(row, q, userContext) {
  const userId = userContext?.id || userContext?.userId;
  const host = (userContext?.corporateContext?.hostCountry || "").toLowerCase();
  const assignment = (userContext?.permissions?.assignmentType || "").toUpperCase();

  if (isFallbackRow(row)) return -1;

  let score = 0;

  if (row.userId) {
    if (row.userId !== userId) return null;
    score += 100;
  }
  if (row.hostCountry && host && row.hostCountry.toLowerCase() !== host) return null;
  if (row.hostCountry) score += 20;
  if (row.assignmentType && assignment && row.assignmentType.toUpperCase() !== assignment) return null;
  if (row.assignmentType) score += 10;

  if (/^01$/.test(row.id) || /greeting/i.test(row.topic)) {
    if (matchesGreeting(q)) score += 50;
    else return null;
  } else if (!matchesKeywords(q, row.keywords)) {
    return null;
  }

  score += Math.max(0, 30 - Number(row.id) || 0);
  if (row.sampleQuestion && q.includes(row.sampleQuestion.toLowerCase().slice(0, 12))) {
    score += 5;
  }
  return score;
}

function formatAnswer(row) {
  let body = row.fullResponse || "";
  const followups = [row.followUp1, row.followUp2, row.followUp3].filter(Boolean);
  if (followups.length) {
    body += "\n---\n" + followups.map((f) => `?? ${f}`).join("\n");
  }
  return body;
}

async function findAnswerFromCatalog(question, userContext) {
  const rows = await loadCatalog();
  if (!rows.length) return null;

  const q = (question || "").toLowerCase().trim();
  let best = null;
  let bestScore = -1;

  for (const row of rows) {
    const score = rowScore(row, q, userContext);
    if (score == null || score < 0) continue;
    if (score > bestScore) {
      bestScore = score;
      best = row;
    }
  }

  if (!best) {
    const fallback = rows.find(isFallbackRow);
    if (fallback) return formatAnswer(fallback);
    return null;
  }

  return formatAnswer(best);
}

function invalidateCache() {
  cache.mtimeMs = 0;
}

module.exports = {
  loadCatalog,
  findAnswerFromCatalog,
  invalidateCache,
  catalogPath,
  matchesKeywords,
};
