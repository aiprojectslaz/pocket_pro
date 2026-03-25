#!/usr/bin/env node
// supabase/import-excel.js
// Reads the TPS procedures Excel and generates supabase/seed.sql
// for the first 3 demo procedures: PROC_001 (01-01), PROC_002 (01-02), PROC_003 (01-03)
//
// Usage:
//   node supabase/import-excel.js
//
// Output: supabase/seed.sql  (paste into Supabase → SQL Editor → Run)

const XLSX = require('xlsx');
const fs   = require('fs');
const path = require('path');

const EXCEL_PATH  = path.join(__dirname, '..', 'Copy of service_procedures_03022023.xlsx');
const OUTPUT_PATH = path.join(__dirname, 'seed.sql');
const TARGET_IDS  = new Set(['PROC_001', 'PROC_002', 'PROC_003']);

// ── Helpers ───────────────────────────────────────────────────────────────────

// Excel serial date → 'YYYY-MM-DD'
function excelDateToISO(serial) {
  if (!serial || typeof serial !== 'number') return null;
  return new Date((serial - 25569) * 86400 * 1000).toISOString().split('T')[0];
}

// Plain text → Strapi blocks array (what Vue components iterate over)
function textToBlocks(text) {
  if (!text) return [];
  const str = String(text).trim();
  if (!str || str === 'N/A') return [];

  const lines  = str.split('\n');
  const blocks = [];
  let bullets  = [];

  function flushBullets() {
    if (!bullets.length) return;
    blocks.push({
      type:     'list',
      format:   'unordered',
      children: bullets.map(t => ({
        type:     'list-item',
        children: [{ type: 'text', text: t }],
      })),
    });
    bullets = [];
  }

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    if (/^[•\-−]/.test(line)) {
      bullets.push(line.replace(/^[•\-−]\s*/, '').trim());
    } else {
      flushBullets();
      blocks.push({ type: 'paragraph', children: [{ type: 'text', text: line }] });
    }
  }
  flushBullets();
  return blocks;
}

// Escape a value for SQL single-quoted string; returns NULL for empty or 'N/A'
function sq(s) {
  if (s === null || s === undefined) return 'NULL';
  const str = String(s).trim();
  if (str === '' || str === 'N/A') return 'NULL';
  return `'${str.replace(/'/g, "''")}'`;
}

// Serialize a value as inline JSONB SQL literal; returns NULL for empty arrays
function jsonb(val) {
  if (!val || (Array.isArray(val) && !val.length)) return 'NULL';
  return `'${JSON.stringify(val).replace(/'/g, "''")}'::jsonb`;
}

// ── Load workbook ─────────────────────────────────────────────────────────────

if (!fs.existsSync(EXCEL_PATH)) {
  console.error('ERROR: Excel file not found at', EXCEL_PATH);
  console.error('Copy the spreadsheet to the pocket_pro root folder first.');
  process.exit(1);
}

console.log('Reading:', EXCEL_PATH);
const wb = XLSX.readFile(EXCEL_PATH);

// ── Sheet: Procedures ─────────────────────────────────────────────────────────
// Row 0 = type hints, Row 1 = actual column headers, data from row 2 onward

const wsProc  = wb.Sheets['Procedures'];
const procAll = XLSX.utils.sheet_to_json(wsProc, { header: 1 });
const procHdr = procAll[1]; // actual header row

const procedures = procAll.slice(2)
  .filter(r => {
    const pid = r[procHdr.indexOf('Procedure_ID (PK)')];
    const num = r[procHdr.indexOf('Procedure #')];
    return TARGET_IDS.has(pid) && num && /^\d{2}-\d{2}$/.test(String(num));
  })
  .map(r => {
    const g = col => r[procHdr.indexOf(col)];
    return {
      proc_id:           g('Procedure_ID (PK)'),
      procedure_number:  String(g('Procedure #')),
      name:              g('Procedure Name'),
      issue_date:        excelDateToISO(g('LastPublished (Issued)')),
      status:            g('Status'),
      replaces_date:     excelDateToISO(g('Replaces:')),
      rationale:         g('Rationale'),
      supervision:       g('Supervision'),
      procedure_info_tx: g('Procedure'),
    };
  });

// Build lookup: PROC_001 → '01-01'
const procNumById = Object.fromEntries(procedures.map(p => [p.proc_id, p.procedure_number]));

// ── Sheet: Governing Authority ────────────────────────────────────────────────

const wsGov  = wb.Sheets['Governing Authority'];
const govAll = XLSX.utils.sheet_to_json(wsGov, { header: 1 });
const govHdr = govAll[0];
const govMap = {}; // proc_id → [string]

govAll.slice(1).forEach(r => {
  const pid  = r[govHdr.indexOf('Procedure_ID')];
  const name = r[govHdr.indexOf('Authority_name')];
  const jur  = r[govHdr.indexOf('Jurisdiction')];
  if (!TARGET_IDS.has(pid) || !name) return;
  (govMap[pid] = govMap[pid] || []).push(`${name}${jur ? ' (' + jur + ')' : ''}`);
});

// ── Sheet: Associated Governance ──────────────────────────────────────────────

const wsAssoc  = wb.Sheets['Associated Governance'];
const assocAll = XLSX.utils.sheet_to_json(wsAssoc, { header: 1 });
const assocHdr = assocAll[0];
const assocMap = {}; // proc_id → [string]

assocAll.slice(1).forEach(r => {
  const pid  = r[assocHdr.indexOf('Procedure_ID')];
  const name = r[assocHdr.indexOf('Governance_name')];
  const type = r[assocHdr.indexOf('Gov_Type')];
  if (!TARGET_IDS.has(pid) || !name) return;
  (assocMap[pid] = assocMap[pid] || []).push(type ? `${type}: ${name}` : name);
});

// ── Sheet: Sub_procedures ─────────────────────────────────────────────────────
// Headers: Sub_procedure_ID | Procedure_ID (FK) | Procedure_Num | Procedure Name |
//          Parent | Sub-Procedure Name | Sub-Procedure TEXT | Sub_Procedure_roles

const wsSub  = wb.Sheets['Sub_procedures'];
const subAll = XLSX.utils.sheet_to_json(wsSub, { header: 1 });
// col indices: 0=ID, 1=Procedure_ID, 2=Proc_Num, 3=ProcName, 4=Parent, 5=Name, 6=Text, 7=Roles

const ROLE_RE = / - (Police Officer|Officer in Charge|Member|Court Officer|Custodial Officer|Unit Commander|Investigating Officer|Supervisor)$/i;

const allSubs = subAll.slice(1).filter(r => TARGET_IDS.has(r[1]));

// Rows whose name ends with "- [Role Title]" → main_roles table
const mainRoleRows = allSubs.filter(r => r[7] === 'Yes' && ROLE_RE.test(r[5]));
// All others → sub_procedures table
const subProcRows  = allSubs.filter(r => !(r[7] === 'Yes' && ROLE_RE.test(r[5])));

// ── Sheet: Definitions ────────────────────────────────────────────────────────
// Headers: Definition_ID | Procedure_ID | Definition_title | Definition_txt

const wsDef  = wb.Sheets['Definitions'];
const defAll = XLSX.utils.sheet_to_json(wsDef, { header: 1 });
// col indices: 0=ID, 1=Procedure_ID, 2=title, 3=txt

const defRows = defAll.slice(1).filter(r => TARGET_IDS.has(r[1]));

// Deduplicate by term (same definition may appear in multiple procedures)
const termsSeen  = new Map(); // term → first proc_id that defined it
const termLinks  = [];        // {term, proc_id} for procedure_definitions
defRows.forEach(r => {
  const term   = r[2];
  const txt    = r[3];
  const procId = r[1];
  if (!term) return;
  if (!termsSeen.has(term)) termsSeen.set(term, { term, txt });
  termLinks.push({ term, proc_id: procId });
});

// ── Sheet: Appendix ───────────────────────────────────────────────────────────
// Headers: Procedure_ID | Appendix_Num | Appendix_Title | LastPublished (Issued) |
//          Chapter # | Status | Replaces: | Appendix_txt | Rationale |
//          Sub_rationale_1.0 | Sub_rationale_1.1 | Sub_rationale_1.2 | Sub_rationale_2.0

const wsApp  = wb.Sheets['Appendix'];
const appAll = XLSX.utils.sheet_to_json(wsApp, { header: 1 });
const appHdr = appAll[0];

const appRows = appAll.slice(1).filter(r => TARGET_IDS.has(r[0]));

// ── Build SQL ─────────────────────────────────────────────────────────────────

const out = [];

out.push('-- ============================================================');
out.push('-- Pocket Pro – Seed Data: Procedures 01-01, 01-02, 01-03');
out.push(`-- Generated: ${new Date().toISOString()}`);
out.push('-- Paste into: Supabase → SQL Editor → Run All');
out.push('-- ============================================================');
out.push('');

// Helper: subquery to get a procedure id by procedure_number
const procIdRef = num => `(SELECT id FROM procedures WHERE procedure_number = ${sq(num)} LIMIT 1)`;

// 1 ── Chapter ────────────────────────────────────────────────────────────────
out.push('-- 1. Chapter');
out.push(`INSERT INTO chapters (title)`);
out.push(`VALUES ('Chapter 1 – Arrest & Release')`);
out.push(`ON CONFLICT DO NOTHING;`);
out.push('');

// 2 ── Procedures ─────────────────────────────────────────────────────────────
out.push('-- 2. Procedures');
procedures.forEach(p => {
  const govBlocks   = (govMap[p.proc_id]   || []).map(t => ({ type: 'paragraph', children: [{ type: 'text', text: t }] }));
  const assocBlocks = (assocMap[p.proc_id] || []).map(t => ({ type: 'paragraph', children: [{ type: 'text', text: t }] }));
  const infoBlocks  = textToBlocks(p.procedure_info_tx);

  out.push(`-- ${p.procedure_number} ${p.name}`);
  out.push(`INSERT INTO procedures`);
  out.push(`  (procedure_number, name, issue_date, status, replaces_date, chapter_id,`);
  out.push(`   rationale, supervision, procedure_info, governing_authority, associated_governance)`);
  out.push(`VALUES (`);
  out.push(`  ${sq(p.procedure_number)},`);
  out.push(`  ${sq(p.name)},`);
  out.push(`  ${sq(p.issue_date)},`);
  out.push(`  ${sq(p.status)},`);
  out.push(`  ${sq(p.replaces_date)},`);
  out.push(`  (SELECT id FROM chapters WHERE title = 'Chapter 1 – Arrest & Release' LIMIT 1),`);
  out.push(`  ${sq(p.rationale)},`);
  out.push(`  ${sq(p.supervision)},`);
  out.push(`  ${jsonb(infoBlocks)},`);
  out.push(`  ${jsonb(govBlocks)},`);
  out.push(`  ${jsonb(assocBlocks)}`);
  out.push(`);`);
  out.push('');
});

// 3 ── Sub-procedures ─────────────────────────────────────────────────────────
out.push('-- 3. Sub-procedures');
subProcRows.forEach(r => {
  const procNum = procNumById[r[1]];
  const name    = r[5];
  const blocks  = textToBlocks(r[6]);
  if (!procNum || !name || !blocks.length) return;
  out.push(`INSERT INTO sub_procedures (name, description, procedure_id) VALUES (`);
  out.push(`  ${sq(name)},`);
  out.push(`  ${jsonb(blocks)},`);
  out.push(`  ${procIdRef(procNum)}`);
  out.push(`);`);
});
out.push('');

// 4 ── Main roles ─────────────────────────────────────────────────────────────
out.push('-- 4. Main roles');
mainRoleRows.forEach(r => {
  const procNum  = procNumById[r[1]];
  const match    = String(r[5]).match(ROLE_RE);
  const roleName = match ? match[1] : r[5];
  const blocks   = textToBlocks(r[6]);
  if (!procNum || !blocks.length) return;
  out.push(`INSERT INTO main_roles (role_title, description, procedure_id) VALUES (`);
  out.push(`  ${sq(roleName)},`);
  out.push(`  ${jsonb(blocks)},`);
  out.push(`  ${procIdRef(procNum)}`);
  out.push(`);`);
});
out.push('');

// 5 ── Definitions ────────────────────────────────────────────────────────────
out.push('-- 5. Definitions (unique terms)');
termsSeen.forEach(({ term, txt }) => {
  const blocks = textToBlocks(txt);
  if (!blocks.length) return;
  out.push(`INSERT INTO definitions (term, definition)`);
  out.push(`VALUES (${sq(term)}, ${jsonb(blocks)})`);
  out.push(`ON CONFLICT (term) DO NOTHING;`);
});
out.push('');

// 6 ── procedure_definitions (M:M links) ──────────────────────────────────────
out.push('-- 6. Procedure–definition links');
termLinks.forEach(({ term, proc_id }) => {
  const procNum = procNumById[proc_id];
  if (!procNum) return;
  out.push(`INSERT INTO procedure_definitions (procedure_id, definition_id)`);
  out.push(`SELECT ${procIdRef(procNum)}, id FROM definitions WHERE term = ${sq(term)}`);
  out.push(`ON CONFLICT DO NOTHING;`);
});
out.push('');

// 7 ── Appendices ─────────────────────────────────────────────────────────────
out.push('-- 7. Appendices');
appRows.forEach(r => {
  const proc_id    = r[0];
  const procNum    = procNumById[proc_id];
  if (!procNum) return;

  // Combine all text columns (indices 7-12) into one block array
  const textParts  = [r[8], r[9], r[10], r[11], r[12]].filter(Boolean);
  // Appendix_txt (index 7) is usually null; rationale is index 8
  const mainTxt    = r[7] || '';
  const combined   = [mainTxt, ...textParts].filter(Boolean).join('\n');
  const blocks     = textToBlocks(combined);

  const appNum     = r[1];  // e.g. "01-02 App B"
  const title      = r[2];  // e.g. "Risk Assessment – Type of Search"
  const issueDate  = excelDateToISO(r[3]);
  const status     = r[5];
  const replDate   = excelDateToISO(r[6]);

  out.push(`INSERT INTO appendices (name, title, description, status, issue_date, replaces_date, procedure_id) VALUES (`);
  out.push(`  ${sq(appNum)},`);
  out.push(`  ${sq(title)},`);
  out.push(`  ${jsonb(blocks)},`);
  out.push(`  ${sq(status)},`);
  out.push(`  ${sq(issueDate)},`);
  out.push(`  ${sq(replDate)},`);
  out.push(`  ${procIdRef(procNum)}`);
  out.push(`);`);
});
out.push('');

out.push('-- ============================================================');
out.push('-- Done. Verify row counts in Supabase Table Editor.');
out.push('-- ============================================================');

// ── Write output ──────────────────────────────────────────────────────────────
fs.writeFileSync(OUTPUT_PATH, out.join('\n'), 'utf8');
console.log(`\nWrote ${out.length} lines → ${OUTPUT_PATH}`);
console.log('\nSummary:');
console.log(`  Procedures:    ${procedures.length}`);
console.log(`  Sub-procs:     ${subProcRows.length}`);
console.log(`  Main roles:    ${mainRoleRows.length}`);
console.log(`  Definitions:   ${termsSeen.size} unique terms, ${termLinks.length} links`);
console.log(`  Appendices:    ${appRows.length}`);
console.log(`  Gov Authority: ${Object.values(govMap).flat().length} entries`);
console.log(`  Assoc Gov:     ${Object.values(assocMap).flat().length} entries`);
console.log('\nNext: paste supabase/seed.sql into Supabase → SQL Editor → Run All');
