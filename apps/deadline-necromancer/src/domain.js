// domain.js — Deadline Necromancer: logika khusus app 1.
// Status deadline + ekspor kalender .ics (RFC 5545).

/** Hitung status deadline relatif terhadap hari ini (waktu lokal). */
export function deadlineStatus(deadlineStr) {
  // Bandingkan tanggal kalender saja (bukan jam), agar "3 hari lagi" terasa benar.
  const d = new Date(deadlineStr + "T00:00:00");
  if (Number.isNaN(d.getTime())) return "invalid";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((d - today) / 86400000);
  if (diffDays < 0) return "overdue"; // lewat
  if (diffDays <= 3) return "soon";   // < 3 hari
  return "safe";
}

const STATUS_LABEL = { overdue: "☠️ Lewat", soon: "⏳ < 3 hari", safe: "✅ Aman" };

export function transformDeadlines(rows) {
  return rows
    .map((r) => {
      const status = deadlineStatus(r.deadline);
      return { ...r, __status: status, status: STATUS_LABEL[status] ?? status };
    })
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
}

/** Bangun file .ics dari baris tugas (satu VEVENT per tugas). */
export function toICS(rows) {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const events = rows.map((r, i) => {
    const dt = r.deadline.replace(/-/g, "");
    const summary = escapeICS(`${r.tugas} (${r.mata_kuliah})`);
    return [
      "BEGIN:VEVENT",
      `UID:necromancer-${i}-${stamp}@afterlife-kit`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${dt}T090000`,
      `SUMMARY:${summary}`,
      "END:VEVENT",
    ].join("\r\n");
  });
  return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Afterlife Kit//Deadline Necromancer//ID", ...events, "END:VCALENDAR"].join("\r\n");
}

function escapeICS(s) {
  return String(s).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}
