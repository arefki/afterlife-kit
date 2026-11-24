# Afterlife Kit — Requirements

## Introduction

Afterlife Kit is a local-first web template for processing CSV data without any server or dependencies. It provides a consistent workflow: **Import CSV → Validate → Transform → Export**.

The same foundation powers two distinct applications:

1. **Deadline Necromancer**: Student assignment CSV → deadline status + .ics calendar export
2. **Receipt Revenant**: Expense CSV → category summaries + clean normalized CSV export

All processing happens 100% in the browser. No data leaves the user's device.

---

## Requirements

### R1. CSV Import with Drop Zone

**User Story**: As a user, I want to drag and drop a CSV file so I can import my data without typing anything.

**Acceptance Criteria (EARS)**:
- **WHEN** I drag a CSV file over the drop zone, THEN the zone highlights visually.
- **WHEN** I drop a valid CSV file, THEN the first 10 rows display in a preview table.
- **WHEN** the file has a `.csv` extension, THEN the system detects and processes it.
- **WHEN** I drop a non-CSV file, THEN I see: "File harus berformat CSV."

### R2. Automatic Column Detection

**User Story**: As a user, I want the system to detect column names automatically so I don't need to configure anything for standard CSVs.

**Acceptance Criteria (EARS)**:
- **WHEN** I import a CSV with headers, THEN the first row displays as column names.
- **WHEN** headers match expected names (case-insensitive), THEN the system suggests the correct mapping.
- **WHEN** the CSV has no header row, THEN I see an option to enter headers manually.

### R3. Manual Column Mapping

**User Story**: As a user, I want to map columns manually when the automatic detection fails so I can still use non-standard CSV formats.

**Acceptance Criteria (EARS)**:
- **WHEN** I see a column mapping UI, THEN I can select each expected field from a dropdown.
- **WHEN** I change a mapping, THEN the preview table updates immediately.
- **WHEN** I select "Skip this column", THEN that column is ignored during processing.

### R4. Validation with Clear Errors

**User Story**: As a user, I want clear error messages when my CSV is invalid so I can fix the problem quickly.

**Acceptance Criteria (EARS)**:
- **WHEN** the CSV is empty, THEN I see: "File CSV kosong. Tambahkan data dan coba lagi."
- **WHEN** a required column is missing, THEN I see: "Kolom 'X' diperlukan tapi tidak ditemukan."
- **WHEN** a date field is invalid, THEN I see: "Baris N: Tanggal tidak valid (gunakan format YYYY-MM-DD)."
- **WHEN** a numeric field is invalid, THEN I see: "Baris N: Nilai 'X' harus berupa angka."
- **WHEN** validation fails, THEN the process stops and no data is processed.

### R5. Deadline Necromancer — Import & Validation

**User Story**: As a student, I want to import my assignment spreadsheet so I can see all deadlines in one place.

**Acceptance Criteria (EARS)**:
- **WHEN** I import a CSV with columns: `task`, `course`, `deadline`, THEN the system accepts it.
- **WHEN** I import a CSV with alternative column names (`tugas`, `matakuliah`, `tanggal_tugas`), THEN the system accepts it after mapping.
- **WHEN** I import a CSV missing any of these columns, THEN I see a clear error message.

### R6. Deadline Necromancer — Status Calculation

**User Story**: As a student, I want to see which assignments are overdue or urgent so I can prioritize my work.

**Acceptance Criteria (EARS)**:
- **WHEN** I process the CSV, THEN each task gets a status: `overdue`, `under 3 days`, or `safe`.
- **WHEN** today's date is past the deadline, THEN status = `overdue`.
- **WHEN** the deadline is within 3 days (including today), THEN status = `under 3 days`.
- **WHEN** the deadline is more than 3 days away, THEN status = `safe`.
- **WHEN** the deadline field is empty, THEN status = `pending`.

### R7. Deadline Necromancer — Sorted List Display

**User Story**: As a student, I want to see my assignments sorted by deadline so I know what to do first.

**Acceptance Criteria (EARS)**:
- **WHEN** I view the results, THEN tasks are sorted by deadline date (earliest first).
- **WHEN** I click a column header, THEN sorting toggles ascending/descending.
- **WHEN** I sort by status, THEN overdue tasks appear first.

### R8. Deadline Necromancer — .ics Calendar Export

**User Story**: As a student, I want to export my assignments as a calendar file so I can import it into Google Calendar, Outlook, etc.

**Acceptance Criteria (EARS)**:
- **WHEN** I click "Export .ics", THEN a `.ics` file downloads.
- **WHEN** I open the `.ics` file in a calendar app, THEN all assignment events appear.
- **WHEN** the export succeeds, THEN I see a toast: "Kalender .ics berhasil diunduh."

### R9. Receipt Revenant — Import & Validation

**User Story**: As a budget tracker, I want to import my expense spreadsheet so I can analyze my spending.

**Acceptance Criteria (EARS)**:
- **WHEN** I import a CSV with columns: `date`, `description`, `amount`, THEN the system accepts it.
- **WHEN** I import a CSV with alternative column names (`tanggal`, `keterangan`, `nominal`), THEN the system accepts it after mapping.
- **WHEN** amount contains non-numeric characters, THEN validation catches it.

### R10. Receipt Revenant — Category Summary

**User Story**: As a budget tracker, I want to see my spending by category and by month so I can identify patterns.

**Acceptance Criteria (EARS)**:
- **WHEN** I process the CSV, THEN the system calculates totals per month.
- **WHEN** I process the CSV, THEN the system calculates totals per description (as a proxy for category).
- **WHEN** I view the summary, THEN I see a table with: Month | Description | Total | Count.
- **WHEN** I view the summary, THEN I see a grand total at the bottom.

### R11. Receipt Revenant — Clean CSV Export

**User Story**: As a budget tracker, I want to export a normalized CSV so I can import it into spreadsheet software.

**Acceptance Criteria (EARS)**:
- **WHEN** I click "Export CSV", THEN a clean CSV file downloads.
- **WHEN** I open the exported CSV, THEN all dates use YYYY-MM-DD format.
- **WHEN** I open the exported CSV, THEN amounts use decimal point (e.g., `12345.00`).
- **WHEN** I open the exported CSV, THEN headers are: `date`, `description`, `amount`.

### R12. Local-First Privacy Guarantee

**User Story**: As a privacy-conscious user, I want to know my data never leaves my device so I can trust the app with sensitive information.

**Acceptance Criteria (EARS)**:
- **WHEN** I use the app, THEN no network requests are made except to load the page itself.
- **WHEN** I check the browser's Network tab, THEN there are no requests to analytics or tracking domains.
- **WHEN** I delete my browser's localStorage, THEN all my data is permanently removed.
- **WHEN** I click "Hapus data saya", THEN all stored data clears immediately.
- **WHEN** the page loads from `file://`, THEN the app works identically.

### R13. Persistent localStorage (Optional)

**User Story**: As a returning user, I want my last import to persist so I don't need to re-upload every time I visit.

**Acceptance Criteria (EARS)**:
- **WHEN** I successfully validate a CSV, THEN the system stores it in localStorage.
- **WHEN** I refresh the page, THEN my last data reappears in the preview.
- **WHEN** I delete my data via "Hapus data saya", THEN localStorage is cleared.
- **WHEN** localStorage exceeds 5MB, THEN the system shows a warning but does not crash.

### R14. Dark Horror Theme UI

**User Story**: As a user of a "Necromancer/Revenant" themed app, I want a visually striking interface that matches the theme.

**Acceptance Criteria (EARS)**:
- **WHEN** the app loads, THEN the background is dark (black or deep gray).
- **WHEN** I view text, THEN headings use neon colors (e.g., `#ff0055` red, `#00ffcc` teal).
- **WHEN** I hover over buttons, THEN they glow with a subtle shadow.
- **WHEN** I view an error message, THEN it appears in red with a pulsing animation.
- **WHEN** I view success messages, THEN they appear in green.

### R15. Sample Data for Judges

**User Story**: As a judge evaluating my submission, I want sample CSV files so I can test the apps without creating data myself.

**Acceptance Criteria (EARS)**:
- **WHEN** I look in `apps/deadline-necromancer/`, THEN I see `sample.csv`.
- **WHEN** I open `sample.csv`, THEN it contains at least 5 realistic assignment rows.
- **WHEN** I look in `apps/receipt-revenant/`, THEN I see `sample.csv`.
- **WHEN** I open `sample.csv`, THEN it contains at least 10 expense rows with varied categories.
- **WHEN** I import each sample file, THEN the app processes it successfully.
