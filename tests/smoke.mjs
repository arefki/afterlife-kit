// Smoke test: template core + Deadline Necromancer (App 1) + Receipt Revenant (App 2).
// Pure-module path — no DOM, no browser needed.
// Run: node tests/smoke.mjs  (from the repo root)
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { parseCSV, toCSV, detectDelimiter, suggestMapping, applyMapping } from "../template/src/csv.js";
import { transformDeadlines, toICS, deadlineStatus } from "../apps/deadline-necromancer/src/domain.js";
import { appConfig } from "../apps/deadline-necromancer/src/app-config.js";
import { transformReceipts, summarizeByCategory, summarizeByMonthDescription, toCleanCSV, categorize } from "../apps/receipt-revenant/src/domain.js";
import { appConfig as receiptConfig } from "../apps/receipt-revenant/src/app-config.js";
import { renderSummary, renderMonthlySummary } from "../template/src/ui.js";
// Import-only checks for DOM-touching modules (no top-level DOM access expected):
import "../template/src/app.js";
import "../template/src/ui.js";
import "../template/src/store.js";
import "../template/src/app-config.js";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

let pass = 0, fail = 0;
function check(name, cond, extra = "") {
  if (cond) { pass++; console.log(`PASS ${name}`); }
  else { fail++; console.log(`FAIL ${name} ${extra}`); }
}

// 1. Parse the real sample.csv (App 1)
const sample = fs.readFileSync(path.join(ROOT, "apps/deadline-necromancer/sample.csv"), "utf8");
const { headers, rows, errors } = parseCSV(sample);
check("sample.csv parses: 5 rows, 0 errors", rows.length === 5 && errors.length === 0, JSON.stringify(errors));
check("headers correct", JSON.stringify(headers) === JSON.stringify(["tugas", "mata_kuliah", "deadline"]));

// 2. All rows validate under the app contract
const bad = rows.map((r) => appConfig.validateRow(r)).filter(Boolean);
check("all sample rows validate", bad.length === 0, JSON.stringify(bad));

// 3. Transform: statuses + sort (today 2026-11-24)
const t = transformDeadlines(rows);
const statuses = t.map((r) => r.__status);
check("statuses in deadline order", JSON.stringify(statuses) === JSON.stringify(["overdue", "overdue", "overdue", "soon", "safe"]), JSON.stringify(statuses));
check("sorted ascending by deadline", t[0].deadline === "2026-11-10" && t[4].deadline === "2026-12-05");

// 4. .ics export: structure + 5 events
const ics = toICS(t);
check("ics has VCALENDAR wrapper", ics.startsWith("BEGIN:VCALENDAR") && ics.includes("END:VCALENDAR"));
check("ics has 5 VEVENTs", (ics.match(/BEGIN:VEVENT/g) || []).length === 5);
check("ics DTSTART format YYYYMMDDTHHMMSS", /DTSTART:20261110T090000/.test(ics));

// 5. Edge cases on the parser
check("empty CSV errors", parseCSV("").errors.length > 0);
check("quoted comma parses", parseCSV('a,b\n"x, y",2').rows[0].a === "x, y");
check("bad column count errors with line number", parseCSV("a,b\n1\n").errors[0]?.includes("Baris 2"));
check("CRLF handled", parseCSV("a,b\r\n1,2\r\n").rows.length === 1);
check("toCSV round-trip escapes quotes", toCSV(["a"], [{ a: 'say "hi"' }]).includes('"say ""hi"""'));

// 6. Domain edge cases
check("deadlineStatus invalid date", deadlineStatus("bukan-tanggal") === "invalid");
check("validateRow rejects bad date", typeof appConfig.validateRow({ tugas: "x", mata_kuliah: "y", deadline: "32-13-2026" }) === "string");
check("validateRow rejects empty tugas", typeof appConfig.validateRow({ tugas: "", mata_kuliah: "y", deadline: "2026-12-01" }) === "string");

// 7. Delimiter auto-detect (Week 2, Kiro)
check("detectDelimiter semicolon", detectDelimiter("a;b;c\n1;2;3") === ";");
check("detectDelimiter tab", detectDelimiter("a\tb\n1\t2") === "\t");
check("detectDelimiter comma", detectDelimiter("a,b\n1,2") === ",");
check("detectDelimiter default single column", detectDelimiter("abc\ndef") === ",");
check("detectDelimiter ignores quoted delimiter", detectDelimiter('a,b\n"x;y",2') === ",");
check("parseCSV semicolon file", (() => { const r = parseCSV("a;b\n1;2"); return r.delimiter === ";" && r.rows[0].b === "2"; })());
check("parseCSV tab file", (() => { const r = parseCSV("a\tb\n1\t2"); return r.delimiter === "\t" && r.rows[0].a === "1"; })());
check("parseCSV semicolon with quoted field", (() => { const r = parseCSV('a;b\n"x;y";2'); return r.rows[0].a === "x;y" && r.errors.length === 0; })());

// 8. Case-insensitive mapping + aliases (Week 2, Kiro)
check("suggestMapping case-insensitive", JSON.stringify(suggestMapping(["Tugas", "MATA_KULIAH", "Deadline"], ["tugas", "mata_kuliah", "deadline"])) === JSON.stringify({ tugas: "Tugas", mata_kuliah: "MATA_KULIAH", deadline: "Deadline" }));
check("suggestMapping alias", suggestMapping(["task", "course", "due"], ["tugas", "mata_kuliah", "deadline"], { tugas: ["task"], mata_kuliah: ["course"], deadline: ["due"] }).deadline === "due");
check("suggestMapping null when missing", suggestMapping(["a", "b"], ["tugas", "deadline"]).tugas === null);
check("suggestMapping prefers exact over alias", suggestMapping(["deadline", "due"], ["deadline"], { deadline: ["due"] }).deadline === "deadline");
check("applyMapping remaps, skips null, keeps __line", (() => {
  const r = applyMapping([{ Task: "x", __line: 2 }], { tugas: "Task", deadline: null });
  return r[0].tugas === "x" && !("deadline" in r[0]) && r[0].__line === 2;
})());

// 9. Receipt Revenant end-to-end at module level (Week 2)
const rsample = fs.readFileSync(path.join(ROOT, "apps/receipt-revenant/sample.csv"), "utf8");
const rp = parseCSV(rsample);
check("receipt sample.csv parses: 10 rows, 0 errors (R15)", rp.rows.length === 10 && rp.errors.length === 0, JSON.stringify(rp.errors));
const rbad = rp.rows.map((r) => receiptConfig.validateRow(r)).filter(Boolean);
check("all receipt rows validate", rbad.length === 0, JSON.stringify(rbad));
const rt = transformReceipts(rp.rows);
check("receipt categories assigned", rt.find((r) => r.deskripsi === "Makan siang warteg").kategori === "Makanan"
  && rt.find((r) => r.deskripsi === "Ojek online ke kampus").kategori === "Transport"
  && rt.find((r) => r.deskripsi === "Tagihan listrik bulanan").kategori === "Tagihan"
  && rt.find((r) => r.deskripsi === "Pembelian buku kuliah").kategori === "Lainnya");
check("receipt bulan + jumlah normalized", rt.every((r) => /^\d{4}-\d{2}$/.test(r.bulan) && typeof r.jumlah === "number"));
const summary = summarizeByCategory(rt);
const byCat = Object.fromEntries(summary.map((s) => [s.kategori, s.total]));
check("receipt totals per category", byCat.Makanan === 75000 && byCat.Transport === 42000
  && byCat.Belanja === 87000 && byCat.Tagihan === 272000 && byCat.Hiburan === 50000 && byCat.Lainnya === 125000,
  JSON.stringify(byCat));
check("receipt grand total 651000", summary.reduce((a, s) => a + s.total, 0) === 651000);
const clean = toCleanCSV(rt);
const cleanLines = clean.split("\n");
check("clean CSV headers + 10 rows", cleanLines[0] === "tanggal,deskripsi,jumlah,kategori,bulan" && cleanLines.length === 11);
check("clean CSV row carries kategori", cleanLines[1].includes("Makanan") && cleanLines[1].includes("2026-11"));
check("categorize unknown returns Lainnya", categorize("sesuatu yang aneh") === "Lainnya");
check("receipt validateRow rejects non-numeric jumlah", typeof receiptConfig.validateRow({ tanggal: "2026-11-01", deskripsi: "x", jumlah: "abc" }) === "string");

// 10. Full app-path: non-standard headers resolve via mapping (Week 2)
check("app-path: mixed-case + alias headers map and validate", (() => {
  const csv = "TANGGAL,Description,AMOUNT\n2026-11-01,Kopi kafe,25000";
  const parsed = parseCSV(csv);
  const m = suggestMapping(parsed.headers, receiptConfig.requiredColumns, receiptConfig.columnAliases);
  if (Object.values(m).some((v) => v === null)) return false;
  const mapped = applyMapping(parsed.rows, m);
  return receiptConfig.validateRow(mapped[0]) === null && mapped[0].tanggal === "2026-11-01";
})());
check("app-path: semicolon receipt CSV parses and validates", (() => {
  const parsed = parseCSV("tanggal;deskripsi;jumlah\n2026-11-01;Kopi kafe;25000");
  return parsed.delimiter === ";" && receiptConfig.validateRow(parsed.rows[0]) === null;
})());
check("app-path: deadline alias headers map (task/course/due)", (() => {
  const parsed = parseCSV("task,course,due\nTugas 1,Ekonomi,2026-12-01");
  const m = suggestMapping(parsed.headers, appConfig.requiredColumns, appConfig.columnAliases);
  if (Object.values(m).some((v) => v === null)) return false;
  const mapped = applyMapping(parsed.rows, m);
  return appConfig.validateRow(mapped[0]) === null && mapped[0].tugas === "Tugas 1";
})());

// 11. R10 summary table wiring (Week 2/3) — renderSummary via stub elements
// (renderSummary only touches el.innerHTML, so a plain object stands in for a DOM node).
const rsummary = receiptConfig.summarize(rt);
check("receipt summarize() maps categories, sorted desc", JSON.stringify(rsummary.rows.map((r) => r.label))
  === JSON.stringify(["Tagihan", "Lainnya", "Belanja", "Makanan", "Hiburan", "Transport"])
  && rsummary.title === "Ringkasan per Kategori" && rsummary.labelHeader === "Kategori",
  JSON.stringify(rsummary.rows));
const stubEl = { innerHTML: "" };
renderSummary(stubEl, rsummary);
check("renderSummary renders title + headers",
  stubEl.innerHTML.includes("<h2>Ringkasan per Kategori</h2>")
  && stubEl.innerHTML.includes("<th>Kategori</th>") && stubEl.innerHTML.includes("<th>Total (Rp)</th>"));
check("renderSummary renders all 6 category totals (Rp, id-ID)",
  ["Tagihan", "Rp272.000", "Lainnya", "Rp125.000", "Belanja", "Rp87.000",
   "Makanan", "Rp75.000", "Hiburan", "Rp50.000", "Transport", "Rp42.000"]
    .every((s) => stubEl.innerHTML.includes(s)), stubEl.innerHTML);
check("renderSummary grand total Rp651.000 in tfoot",
  stubEl.innerHTML.includes("<tfoot>") && stubEl.innerHTML.includes("<strong>Rp651.000</strong>"));
check("renderSummary row order: largest first",
  stubEl.innerHTML.indexOf("Tagihan") < stubEl.innerHTML.indexOf("Transport"));
const emptyEl = { innerHTML: "sebelumnya" };
renderSummary(emptyEl, { title: "X", labelHeader: "Y", rows: [] });
check("renderSummary empty rows clears element", emptyEl.innerHTML === "");
const nullEl = { innerHTML: "sebelumnya" };
renderSummary(nullEl, null);
check("renderSummary null clears element", nullEl.innerHTML === "");
const xssEl = { innerHTML: "" };
renderSummary(xssEl, { title: "T", labelHeader: "L", rows: [{ label: "<img src=x onerror=alert(1)>", total: 1000 }] });
check("renderSummary escapes labels", !xssEl.innerHTML.includes("<img src=x") && xssEl.innerHTML.includes("&lt;img"));
check("renderSummary formats 1000 as Rp1.000", xssEl.innerHTML.includes("Rp1.000"));
check("App 1 config has no summarize (optional hook)", typeof appConfig.summarize === "undefined");
const app2html = fs.readFileSync(path.join(ROOT, "apps/receipt-revenant/index.html"), "utf8");
check("App 2 index.html has summary div + passes it to createApp",
  app2html.includes('id="summary"') && app2html.includes("summary: document.getElementById(\"summary\")"));
const app1html = fs.readFileSync(path.join(ROOT, "apps/deadline-necromancer/index.html"), "utf8");
check("App 1 index.html unchanged (no summary div)", !app1html.includes('id="summary"'));

// 12. R10 penuh: tabel Bulan | Deskripsi | Total | Jumlah (yanti, bukan Kiro)
const rmonthly = summarizeByMonthDescription(rt);
check("monthly summary: 10 groups on sample (all 2026-11, distinct descriptions)",
  rmonthly.length === 10 && rmonthly.every((g) => g.bulan === "2026-11" && g.count === 1),
  JSON.stringify(rmonthly));
check("monthly summary rows sorted by total desc within month",
  JSON.stringify(rmonthly.map((g) => g.total)) === JSON.stringify([250000, 125000, 87000, 50000, 35000, 30000, 25000, 22000, 15000, 12000]),
  JSON.stringify(rmonthly.map((g) => g.total)));
check("monthly summary grand total 651000, count 10",
  rmonthly.reduce((a, g) => a + g.total, 0) === 651000 && rmonthly.reduce((a, g) => a + g.count, 0) === 10);
// Grouping + count across months, same description in two months stays separate.
const multi = summarizeByMonthDescription([
  { bulan: "2026-10", deskripsi: "Kopi kafe", jumlah: 10000 },
  { bulan: "2026-10", deskripsi: "Kopi kafe", jumlah: 20000 },
  { bulan: "2026-11", deskripsi: "Kopi kafe", jumlah: 5000 },
  { bulan: "2026-11", deskripsi: "Bensin motor", jumlah: 30000 },
  { bulan: "2026-11", deskripsi: "Bensin motor", jumlah: 40000 },
]);
check("monthly grouping: 3 groups, counts + totals correct",
  multi.length === 3
  && JSON.stringify(multi[0]) === JSON.stringify({ bulan: "2026-10", deskripsi: "Kopi kafe", total: 30000, count: 2 })
  && JSON.stringify(multi[1]) === JSON.stringify({ bulan: "2026-11", deskripsi: "Bensin motor", total: 70000, count: 2 })
  && JSON.stringify(multi[2]) === JSON.stringify({ bulan: "2026-11", deskripsi: "Kopi kafe", total: 5000, count: 1 }),
  JSON.stringify(multi));
check("monthly grouping: totals per month (Oct 30000, Nov 75000)",
  multi.filter((g) => g.bulan === "2026-10").reduce((a, g) => a + g.total, 0) === 30000
  && multi.filter((g) => g.bulan === "2026-11").reduce((a, g) => a + g.total, 0) === 75000);
check("monthly grouping: totals per description (Kopi 35000, Bensin 70000)",
  multi.filter((g) => g.deskripsi === "Kopi kafe").reduce((a, g) => a + g.total, 0) === 35000
  && multi.filter((g) => g.deskripsi === "Bensin motor").reduce((a, g) => a + g.total, 0) === 70000);
const rmsummary = receiptConfig.summarizeMonthly(rt);
check("receipt summarizeMonthly() returns title + 10 rows",
  rmsummary.title === "Ringkasan per Bulan & Deskripsi" && rmsummary.rows.length === 10
  && rmsummary.rows[0].deskripsi === "Tagihan listrik bulanan" && rmsummary.rows[0].total === 250000);
const mstubEl = { innerHTML: "" };
renderMonthlySummary(mstubEl, rmsummary);
check("renderMonthlySummary renders title + 4 headers",
  mstubEl.innerHTML.includes("<h2>Ringkasan per Bulan &amp; Deskripsi</h2>") // & escaped, as it should be
  && ["<th>Bulan</th>", "<th>Deskripsi</th>", "<th>Total (Rp)</th>", "<th>Jumlah</th>"]
    .every((h) => mstubEl.innerHTML.includes(h)), mstubEl.innerHTML);
check("renderMonthlySummary renders rows (Rp + count)",
  mstubEl.innerHTML.includes("<td>2026-11</td>")
  && mstubEl.innerHTML.includes("Tagihan listrik bulanan")
  && mstubEl.innerHTML.includes("Rp250.000") && mstubEl.innerHTML.includes("<td>1</td>"));
check("renderMonthlySummary grand total Rp651.000 + count 10 in tfoot",
  mstubEl.innerHTML.includes("<tfoot>") && mstubEl.innerHTML.includes("<strong>Rp651.000</strong>")
  && mstubEl.innerHTML.includes("<strong>10</strong>"));
const memptyEl = { innerHTML: "sebelumnya" };
renderMonthlySummary(memptyEl, { title: "X", rows: [] });
check("renderMonthlySummary empty rows clears element", memptyEl.innerHTML === "");
const mnullEl = { innerHTML: "sebelumnya" };
renderMonthlySummary(mnullEl, null);
check("renderMonthlySummary null clears element", mnullEl.innerHTML === "");
const mxssEl = { innerHTML: "" };
renderMonthlySummary(mxssEl, { title: "T", rows: [{ bulan: "2026-11", deskripsi: "<script>alert(1)</script>", total: 1000, count: 1 }] });
check("renderMonthlySummary escapes descriptions",
  !mxssEl.innerHTML.includes("<script>") && mxssEl.innerHTML.includes("&lt;script&gt;"));
check("App 1 config has no summarizeMonthly (optional hook)", typeof appConfig.summarizeMonthly === "undefined");
check("App 2 index.html has summaryMonthly div + passes it to createApp",
  app2html.includes('id="summaryMonthly"') && app2html.includes("summaryMonthly: document.getElementById(\"summaryMonthly\")"));
check("App 1 index.html unchanged (no summaryMonthly div)", !app1html.includes('id="summaryMonthly"'));
check("existing category summarize() untouched (still 6 rows)",
  receiptConfig.summarize(rt).rows.length === 6);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
