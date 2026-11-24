// csv.js — parser CSV tanpa dependensi (fungsi murni, tanpa DOM).
// Mendukung: field ber-tanda-kutip, koma di dalam kutip, kutip ganda (""),
// baris kosong (dilewati), dan CRLF/LF.

/**
 * Parse teks CSV menjadi header + baris.
 * @param {string} text — isi file CSV
 * @returns {{ headers: string[], rows: object[], errors: string[], delimiter: string }}
 */
export function parseCSV(text) {
  const errors = [];
  if (!text || !text.trim()) {
    return { headers: [], rows: [], errors: ["File CSV kosong."], delimiter: "," };
  }

  const delimiter = detectDelimiter(text);
  const lines = splitLines(text);
  const headers = parseLine(lines[0], delimiter).map((h) => h.trim());
  if (headers.length === 0 || headers.every((h) => h === "")) {
    return { headers: [], rows: [], errors: ["Baris pertama (header) tidak ditemukan."], delimiter };
  }

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === "") continue; // lewati baris kosong
    const values = parseLine(lines[i], delimiter);
    if (values.length !== headers.length) {
      errors.push(
        `Baris ${i + 1}: jumlah kolom (${values.length}) tidak sama dengan header (${headers.length}).`
      );
      continue;
    }
    const row = {};
    headers.forEach((h, j) => (row[h] = values[j].trim()));
    row.__line = i + 1; // nomor baris asli, untuk pesan error
    rows.push(row);
  }
  return { headers, rows, errors, delimiter };
}

/**
 * Deteksi delimiter secara otomatis dari baris non-kosong pertama.
 * Mencoba koma, titik-koma, dan tab; pilih yang menghasilkan kolom terbanyak.
 * Jika seri, prioritas: koma > titik-koma > tab. Default koma jika tidak ada.
 * @param {string} text — isi file CSV
 * @returns {string} delimiter yang terdeteksi
 */
export function detectDelimiter(text) {
  const lines = splitLines(text);
  // Cari baris non-kosong pertama
  for (const line of lines) {
    if (!line.trim()) continue;

    // Hitung jumlah delimiter di luar tanda kutip
    const countOutsideQuotes = (ch) => {
      let count = 0;
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const c = line[i];
        if (c === '"') {
          if (inQuotes && line[i + 1] === '"') { i++; } // kutip ganda tetap dalam kutip
          else inQuotes = !inQuotes;
        } else if (!inQuotes && c === ch) {
          count++;
        }
      }
      return count;
    };

    const commaCount = countOutsideQuotes(',');
    const semicolonCount = countOutsideQuotes(';');
    const tabCount = countOutsideQuotes('\t');

    // Pilih yang menghasilkan kolom terbanyak (count + 1)
    // Prioritas jika seri: koma > titik-koma > tab
    if (commaCount >= semicolonCount && commaCount >= tabCount) {
      return ",";
    } else if (semicolonCount >= tabCount) {
      return ";";
    } else {
      return "\t";
    }
  }

  // Fallback jika tidak ada baris non-kosong
  return ",";
}

/**
 * Suggest mapping dari kolom header yang tersedia ke kolom yang diharapkan.
 * Pencarian: 1) cocok persis (case-insensitive), 2) cocok alias (case-insensitive).
 * @param {string[]} headers — nama kolom dari CSV asli
 * @param {string[]} expectedColumns — daftar field yang diharapkan (misal: ['task', 'course', 'deadline'])
 * @param {Record<string, string[]>} [aliases] — mapping expectedField -> array nama alternatif
 * @returns {Record<string, string|null>} objek: expectedField -> nama header asli (atau null)
 */
export function suggestMapping(headers, expectedColumns, aliases = {}) {
  const headerLowerMap = new Map();
  headers.forEach((h) => headerLowerMap.set(h.toLowerCase(), h));

  const result = {};
  for (const expected of expectedColumns) {
    const aliasList = aliases[expected] || [];

    // Cari cocok persis (case-insensitive)
    if (headerLowerMap.has(expected.toLowerCase())) {
      result[expected] = headerLowerMap.get(expected.toLowerCase());
      continue;
    }

    // Cari cocok alias (case-insensitive)
    let found = null;
    for (const alias of aliasList) {
      if (headerLowerMap.has(alias.toLowerCase())) {
        found = headerLowerMap.get(alias.toLowerCase());
        break;
      }
    }
    result[expected] = found ?? null;
  }

  return result;
}

/**
 * Terapkan mapping ke baris-baris CSV.
 * @param {object[]} rows — baris-baris asli (kunci: nama header asli, plus __line)
 * @param {Record<string, string|null>} mapping — mapping expectedField -> nama header asli (atau null)
 * @returns {object[]} baris baru dengan kunci expectedField (field null dibuang, __line dipertahankan)
 */
export function applyMapping(rows, mapping) {
  return rows.map((row) => {
    const newRow = {};
    for (const [expectedKey, originalKey] of Object.entries(mapping)) {
      if (originalKey === null) continue; // skip yang dipetakan ke null
      newRow[expectedKey] = row[originalKey];
    }
    if (row.__line !== undefined) {
      newRow.__line = row.__line;
    }
    return newRow;
  });
}

function splitLines(text) {
  return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
}

// Parser satu baris CSV dengan dukungan tanda kutip (state machine kecil).
function parseLine(line, delimiter = ",") {
  const out = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') { cur += '"'; i++; } // kutip ganda = kutip literal
        else inQuotes = false;
      } else cur += ch;
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === delimiter) {
      out.push(cur); cur = "";
    } else cur += ch;
  }
  out.push(cur);
  return out;
}

/** Escape satu nilai agar aman ditulis kembali sebagai CSV. */
export function toCSV(headers, rows) {
  const esc = (v) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [headers.map(esc).join(",")];
  for (const r of rows) lines.push(headers.map((h) => esc(r[h])).join(","));
  return lines.join("\n");
}
