// app-config.js — Deadline Necromancer (app 1).
// Kontrak app untuk createApp() dari template.

import { transformDeadlines, toICS } from "./domain.js";

export const appConfig = {
  name: "Deadline Necromancer",
  storageKey: "deadline-necromancer",
  requiredColumns: ["tugas", "mata_kuliah", "deadline"],
  // Aliases kolom: expectedField -> array nama alternatif (untuk suggestMapping)
  columnAliases: {
    tugas: ["task", "assignment", "judul"],
    mata_kuliah: ["matakuliah", "course", "mata kuliah", "mk"],
    deadline: ["tanggal_tugas", "due", "due_date", "tenggat"],
  },
  columns: [
    { key: "tugas", label: "Tugas" },
    { key: "mata_kuliah", label: "Mata Kuliah" },
    { key: "deadline", label: "Deadline" },
    { key: "status", label: "Status" },
  ],
  validateRow(row) {
    if (!row.tugas) return "kolom 'tugas' kosong.";
    if (!row.mata_kuliah) return "kolom 'mata_kuliah' kosong.";
    if (!row.deadline) return "kolom 'deadline' kosong.";
    const d = new Date(row.deadline);
    if (Number.isNaN(d.getTime())) {
      return `deadline '${row.deadline}' bukan tanggal yang valid (gunakan format YYYY-MM-DD).`;
    }
    return null;
  },
  transform: transformDeadlines,
  exporters: [
    {
      label: "📅 Ekspor kalender (.ics)",
      filename: "deadline.ics",
      mime: "text/calendar",
      build: toICS,
    },
  ],
};
