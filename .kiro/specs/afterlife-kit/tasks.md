# Afterlife Kit — Tasks

## 1. Template Core

### 1.1 Write `template/src/csv.js` — CSV Parser
- **Requirements: R1, R2, R3**
- Parse CSV text into `{ headers, rows }` structure
- Handle quoted fields with embedded commas
- Auto-detect delimiter (`,`, `;`, `\t`)
- Return clear Indonesian error messages for empty/invalid files

### 1.2 Write `template/src/store.js` — LocalStorage Wrapper
- **Requirements: R13**
- `saveData(key, data)`: Store as JSON with timestamp
- `loadData(key)`: Parse and return (or null)
- `deleteData(key)`: Remove from localStorage
- `getSize()`: Return approximate bytes (warning at 5MB)
- Handle quota exceeded errors gracefully

### 1.3 Write `template/src/ui.js` — UI Components
- **Requirements: R1, R4, R14**
- `DropZone`: Drag/drop handlers with visual feedback
- `PreviewTable`: Render first 10 rows as HTML table
- `ColumnMapper`: Dropdown UI for mapping columns to expected fields
- `Toast`: Success/error notifications
- `ErrorList`: Scrollable validation error display
- All user-facing strings in Bahasa Indonesia

### 1.4 Write `template/src/app.js` — Orchestrator
- **Requirements: R1, R4, R12**
- `init(config)`: Load saved data, attach event listeners
- `handleImport(file)`: Parse → validate → map columns
- `validate(data, config)`: Run app-specific validation
- `transform(data, config)`: Apply app-specific logic
- `exportData(data, type, config)`: Generate export file
- No DOM access—calls `ui.js` functions

### 1.5 Write `template/src/styles.css` — Dark Horror Theme
- **Requirements: R14**
- CSS variables: `--bg-dark`, `--neon-red`, `--neon-teal`, etc.
- Dark background (`#0a0a0a`), glowing button effects
- Error animation (pulse), success animation (fade-in)
- Responsive sizing with `clamp()`/`min()`

### 1.6 Write `template/index.html` — Demo Shell
- **Requirements: R12**
- Single HTML file with module scripts
- Load `styles.css` and all JS modules (`type="module"`)
- Drop zone container, preview table, export buttons
- "Hapus data saya" button for localStorage deletion
- Works when opened via `file://`

---

## 2. App 1: Deadline Necromancer

### 2.1 Write `apps/deadline-necromancer/src/app-config.js`
- **Requirements: R5, R6, R7, R8**
- Export `appConfig` with:
  - `name: 'deadline-necromancer'`
  - `requiredColumns: ['task', 'course', 'deadline']`
  - `columnAliases: { task: ['tugas', 'assignment'], ... }`
  - `exportType: 'ics'`, `exportFilename: 'assignments.ics'`

### 2.2 Write `apps/deadline-necromancer/src/domain.js`
- **Requirements: R5, R6, R7, R8**
- `calculateStatus(deadlineDate, today)`: Returns `'overdue' | 'under 3 days' | 'safe' | 'pending'`
- `tasksToIcs(tasks)`: Generate valid iCalendar v2.0 string
- `sortByDeadline(tasks)`: Sort by date ascending
- `appendStatus(tasks, today)`: Add status field to each task

### 2.3 Write `apps/deadline-necromancer/index.html`
- **Requirements: R5, R6, R7, R8**
- Extend `template/index.html`
- Include `src/app-config.js` and `src/domain.js`
- Add status badge colors (red=overdue, orange=under 3 days, green=safe)
- "Export .ics" button with toast feedback

### 2.4 Write `apps/deadline-necromancer/sample.csv`
- **Requirements: R15**
- At least 5 realistic assignment rows
- Columns: `task, course, deadline`
- Mix of overdue, under 3 days, and safe tasks

### 2.5 Test Deadline Necromancer End-to-End
- **Requirements: R5, R6, R7, R8, R15**
- Import `sample.csv` → validate → display sorted list
- Click column headers to toggle sort
- Export `.ics` → verify file downloads and opens in calendar app
- Test column alias mapping (`tugas`, `matakuliah`, `tanggal_tugas`)
- Test missing column error message

---

## 3. App 2: Receipt Revenant

### 3.1 Write `apps/receipt-revenant/src/app-config.js`
- **Requirements: R9, R10, R11**
- Export `appConfig` with:
  - `name: 'receipt-revenant'`
  - `requiredColumns: ['date', 'description', 'amount']`
  - `columnAliases: { date: ['tanggal'], description: ['keterangan'], amount: ['nominal'] }`
  - `exportType: 'csv'`, `exportFilename: 'expenses-clean.csv'`

### 3.2 Write `apps/receipt-revenant/src/domain.js`
- **Requirements: R9, R10, R11**
- `categorize(description)`: Return inferred category from keywords
- `summarizeByMonth(expenses)`: Return `{ '2026-01': { total, count }, ... }`
- `normalizeCSV(expenses)`: Standardize date (YYYY-MM-DD) and amount (decimal point)
- `calculateTotals(summary)`: Add grand total row

### 3.3 Write `apps/receipt-revenant/index.html`
- **Requirements: R9, R10, R11**
- Extend `template/index.html`
- Include `src/app-config.js` and `src/domain.js`
- Display category summary table (Month | Description | Total | Count)
- Show grand total at bottom
- "Export CSV" button with toast feedback

### 3.4 Write `apps/receipt-revenant/sample.csv`
- **Requirements: R15**
- At least 10 expense rows with varied categories
- Columns: `date, description, amount`
- Mix of food, transport, entertainment, utilities

### 3.5 Test Receipt Revenant End-to-End
- **Requirements: R9, R10, R11, R15**
- Import `sample.csv` → validate → display category summary
- Verify monthly totals and grand total calculations
- Export clean CSV → verify date/amount formats
- Test column alias mapping (`tanggal`, `keterangan`, `nominal`)
- Test non-numeric amount validation error

---

## 4. Robustness Tests

### 4.1 Test Empty File Handling
- **Requirements: R1, R4**
- Drag empty `.csv` file → show: "File CSV kosong. Tambahkan data dan coba lagi."
- Verify no data is processed

### 4.2 Test Missing Column Handling
- **Requirements: R3, R5, R9**
- Import CSV with missing required column → show: "Kolom 'X' diperlukan tapi tidak ditemukan."
- Test both apps with intentionally malformed CSVs

### 4.3 Test Invalid Date Handling
- **Requirements: R4**
- Import CSV with invalid date format (e.g., `31/01/2026`) → show: "Baris N: Tanggal tidak valid (gunakan format YYYY-MM-DD)."
- Test edge cases: `2026-13-01`, `2026-02-30`, non-date strings

### 4.4 Test Invalid Number Handling
- **Requirements: R4, R10**
- Import CSV with non-numeric amount (e.g., `Rp100.000`, `abc`) → show: "Baris N: Nilai 'X' harus berupa angka."
- Test decimal formatting: `100000`, `100.000,50`, `100,000.50`

### 4.5 Test Offline Use (`file://`)
- **Requirements: R12**
- Open `index.html` directly from filesystem
- Import CSV → process → export → verify all work identically
- No network requests in DevTools Network tab

### 4.6 Test "Hapus data saya" Functionality
- **Requirements: R12, R13**
- Import CSV → verify localStorage stores data
- Click "Hapus data saya" → verify data clears
- Refresh page → verify preview is empty
- localStorage should be 0 bytes after deletion

### 4.7 Test localStorage Quota Warning
- **Requirements: R13**
- Store data approaching 5MB limit
- Verify warning appears but app does not crash
- Verify user can still delete data manually

---

## 5. Docs & Deploy

### 5.1 Write README.md for Each App
- **Requirements: R15**
- `apps/deadline-necromancer/README.md`:
  - App description, usage instructions, sample.csv preview
  - Tech stack: vanilla JS, no dependencies
  - License (MIT)
- `apps/receipt-revenant/README.md`:
  - App description, usage instructions, sample.csv preview
  - Tech stack: vanilla JS, no dependencies
  - License (MIT)

### 5.2 Update Shared Docs
- **Requirements: R12**
- `docs/kiro-usage.md`: Update if needed for spec workflow
- `docs/shared-vs-app.md`: Clarify template vs app code separation
- Ensure all docs match current implementation

### 5.3 GitHub Pages Deploy Check
- **Requirements: R12**
- Create `gh-pages` branch or enable Pages in repo settings
- Verify `index.html` opens from `https://user.github.io/repo/`
- Verify both apps work from deployed URL
- No mixed-content warnings (all local resources)

### 5.4 Demo Video Script
- **Requirements: R15**
- Record 1-2 minute screen capture showing:
  1. Open `deadline-necromancer/index.html`
  2. Import `sample.csv`, verify preview and status calculation
  3. Export `.ics`, open in calendar app
  4. Repeat for `receipt-revenant` with CSV export
- Include voiceover explaining local-first, no dependencies

### 5.5 Final Checklist
- **Requirements: All**
- [ ] All 5 core modules written and tested (`csv.js`, `store.js`, `ui.js`, `app.js`, `styles.css`)
- [ ] Both apps have `app-config.js` and `domain.js`
- [ ] Both apps have `index.html` and `sample.csv`
- [ ] All validation errors show Indonesian messages
- [ ] localStorage persistence works (save/load/delete)
- [ ] `.ics` export generates valid iCalendar format
- [ ] Clean CSV export standardizes date/amount formats
- [ ] Dark horror theme applied consistently
- [ ] All sample CSVs process without errors
- [ ] Robustness tests pass (empty file, missing columns, invalid data)
- [ ] No network requests beyond initial page load
- [ ] "Hapus data saya" clears localStorage
- [ ] README files exist for both apps
- [ ] GitHub Pages deploy verified
- [ ] Demo video recorded and uploaded
