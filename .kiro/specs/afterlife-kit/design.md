# Afterlife Kit — Design

## Overview

Afterlife Kit is a **local-first**, **vanilla JavaScript** template that processes CSV files entirely in the browser. It follows the flow:

```
CSV File → CSV Parser → Column Mapping → Validation → Transform (App-Specific) → Export
```

No external dependencies. No build step. No backend. All logic runs client-side in ES modules.

---

## Architecture Diagram (Text)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              index.html (Shell)                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                         styles.css (Dark Horror Theme)                │  │
│  │  • CSS variables (neon colors, spacing)                               │  │
│  │  • Dark background, glowing effects                                   │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
         ┌─────────────────────────────┼─────────────────────────────┐
         ▼                             ▼                             ▼
┌─────────────────┐       ┌─────────────────┐               ┌──────────────────┐
│    ui.js        │       │     csv.js      │               │     store.js     │
│  (UI Component) │       │   (CSV Parser)  │               │  (LocalStorage)  │
│                 │       │                 │               │                  │
│ • Drop zone     │◀─────▶│ • Parse CSV     │◀───┬───▶│ • Save data    │
│ • Preview table │       │ • Validate rows │    │    │ • Load data    │
│ • Toast/Errors  │       │ • Extract cols  │    │    │ • Delete data  │
│ • Export buttons│       │                 │    │    │ • Check size   │
│                 │       │                 │    │    │                  │
└─────────────────┘       └─────────────────┘    │    └──────────────────┘
                ▲                                │                ▲
                │                                │                │
                │        ┌───────────────────────┴───────────────┐│
                │        ▼                                       ▼│
                │  ┌────────────────────────────────────────────┐ │
                │  │         app.js (Orchestrator)              │ │
                │  │                                            │ │
                │  │ • Wire up UI events                        │ │
                │  │ • Coordinate: import → validate → process  │ │
                │  │ • Handle export                            │ │
                │  │ • Manage localStorage persistence          │ │
                │  └────────────────────────────────────────────┘ │
                ▲                                                 ▲
                │                                                 │
         ┌──────┴───────┐                                  ┌──────┴───────┐
         │              │                                  │              │
         ▼              ▼                                  ▼              ▼
┌─────────────────┐ ┌─────────────────┐           ┌─────────────────┐ ┌─────────────────┐
│ app-config.js   │ │  domain.js      │           │ app-config.js   │ │  domain.js      │
│ (App Contract)  │ │ (App Logic)     │           │ (App Contract)  │ │ (App Logic)     │
│                 │ │                 │           │                 │ │                 │
│ • Required cols │ │ • Task → ICS    │           │ • Required cols │ │ • Totals by     │
│ • Mapping rules │ │ • Status calc   │           │ • Mapping rules │ │   month/category│
│ • Export config │ │ • Sort options  │           │ • Export config │ │ • Normalize CSV │
└─────────────────┘ └─────────────────┘           └─────────────────┘ └─────────────────┘
     Deadline Necromancer                                 Receipt Revenant
```

---

## Components

### `csv.js` — CSV Parser

**Responsibility**: Parse CSV text into structured data.

**Key Functions**:
- `parseCSV(text)`: Returns `{ headers: string[], rows: object[] }`
- `extractColumns(data)`: Returns unique column names from first row
- `detectDelimiter(text)`: Auto-detects `,` vs `;` vs `\t`

**Behavior**:
- Handles quoted fields with embedded commas
- Trims whitespace from headers/values
- Returns clear error if file is empty or unparseable

---

### `store.js` — LocalStorage Wrapper

**Responsibility**: Persist data across page loads.

**Key Functions**:
- `saveData(key, data)`: Stringify and store data
- `loadData(key)`: Parse and return stored data (or `null`)
- `deleteData(key)`: Remove from localStorage
- `getSize()`: Return approximate size in bytes (for warning at 5MB)

**Behavior**:
- Catches quota exceeded errors gracefully
- Stores as JSON with timestamp

---

### `ui.js` — UI Components

**Responsibility**: All DOM manipulation and user interaction.

**Key Components**:
- `DropZone`: Handles drag/drop, visual feedback
- `PreviewTable`: Renders CSV data (first 10 rows by default)
- `ColumnMapper`: Dropdown UI for mapping columns to expected fields
- `Toast`: Non-blocking success/error messages
- `ErrorList`: Displays validation errors in a scrollable list

**Behavior**:
- All user-facing strings in Bahasa Indonesia
- No side effects—pure rendering functions
- Accepts callbacks for user actions

---

### `app.js` — Orchestrator

**Responsibility**: Wire everything together.

**Key Functions**:
- `init(config)`: Load saved data (if any), attach event listeners
- `handleImport(file)`: Parse CSV → validate → map columns
- `validate(data, config)`: Run app-specific validation rules
- `transform(data, config)`: Apply app-specific logic (deadline calc / category summary)
- `exportData(data, type, config)`: Generate CSV or .ics file

**Behavior**:
- No direct DOM access—calls `ui.js` functions
- No business logic—delegates to `domain.js`

---

### `app-config.js` — App Contract (Shared)

**Responsibility**: Define what each app needs.

**Structure** (identical shape for both apps):
```javascript
export const appConfig = {
  name: 'deadline-necromancer',  // or 'receipt-revenant'
  requiredColumns: ['task', 'course', 'deadline'],  // example
  columnAliases: { 'task': ['tugas', 'assignment'] },
  delimiter: ',',
  exportType: 'ics',  // or 'csv'
  exportFilename: 'assignments.ics',  // or 'expenses-clean.csv'
};
```

**Behavior**:
- Single source of truth for app configuration
- Imported by both `app.js` and `domain.js`

---

### `domain.js` — App-Specific Logic

**Responsibility**: Unique business logic per app.

**Deadline Necromancer**:
- `calculateStatus(deadlineDate, today)`: Returns `'overdue' | 'under 3 days' | 'safe' | 'pending'`
- `tasksToIcs(tasks)`: Generates valid iCalendar v2.0 string
- `sortByDeadline(tasks)`: Sorts array by date ascending

**Receipt Revenant**:
- `categorize(description)`: Returns inferred category (e.g., "makanan", "transport")
- `summarizeByMonth(expenses)`: Returns `{ '2026-01': total, '2026-02': total, ... }`
- `normalizeCSV(expenses)`: Returns clean array with standardized date/amount format

**Behavior**:
- Pure functions (no DOM, no localStorage)
- Testable in isolation

---

### `styles.css` — Dark Horror Theme

**Responsibility**: Visual design with CSS variables.

**Key Variables**:
```css
:root {
  --bg-dark: #0a0a0a;
  --bg-panel: #1a1a1a;
  --neon-red: #ff0055;
  --neon-teal: #00ffcc;
  --neon-purple: #aa00ff;
  --text-main: #e0e0e0;
  --text-muted: #888;
  --error: #ff3333;
  --success: #33ff33;
}
```

**Behavior**:
- Uses `clamp()` and `min()` for responsive sizing
- Animations for errors (pulse) and success (fade-in)
- No inline styles—everything in CSS

---

## Data Flow

```
User Action (Drag File)
         │
         ▼
  ui.js: DropZone
         │
         ▼
  ui.js: PreviewTable (show first 10 rows)
         │
         ▼
  csv.js: parseCSV(file)
         │
         ▼
  app.js: validate(data, config)
         │
    ┌────┴────┐
    │ Success │
    └────┬────┘
         ▼
  app.js: transform(data, config)
         │
         ▼
  domain.js: App-specific logic
         │
         ▼
  ui.js: Render results table
         │
         ▼
  store.js: saveData()
         │
         ▼
  User clicks Export
         │
         ▼
  app.js: exportData(data, type, config)
         │
         ▼
  domain.js: Generate file content
         │
         ▼
  ui.js: Download trigger
```

---

## Deliberate Design Decisions

### 1. No Framework, No Build Step

**Why**: The template must run from `file://` and be immediately usable. No `npm install`, no `webpack`, no `React`. Judges can open `index.html` and see it work instantly.

**Tradeoff**: More verbose DOM manipulation. Mitigated by clean separation and reusable `ui.js` component functions.

### 2. Shared Template → App-Specific `domain.js`

**Why**: Two apps must feel distinct. Keeping logic separate prevents "one app with two themes" syndrome. Only parser, storage, UI, and orchestration are shared.

**Implementation**: `app.js` imports `domain.js` and calls exported functions. Each app has its own `domain.js`.

### 3. `app-config.js` as Single Contract

**Why**: Ensures both apps implement the same interface for `app.js`. Easy to add new apps by following the contract.

**Structure**: Must export `requiredColumns`, `columnAliases`, `exportType`, etc.

### 4. 100% Client-Side Processing

**Why**: Privacy. No data leaves the device. No servers to maintain. Works offline.

**Tradeoff**: No multi-device sync. Acceptable because this is a demo/hackathon project.

### 5. Bahasa Indonesia for All User-Facing Strings

**Why**: Local-first tool for Indonesian users (judges, students, budget trackers). Clear error messages in native language.

**Implementation**: String literals in `ui.js` and error messages in `csv.js` are Indonesian.

### 6. Preview Only First 10 Rows

**Why**: Large CSVs shouldn't freeze the browser. 10 rows is enough to verify structure.

**Tradeoff**: Users must import to see full results. Acceptable because full results render after validation.

### 7. localStorage Optional + Delete Button

**Why**: Convenience (don't re-upload), but respect privacy (easy to delete).

**Implementation**: Loads on `init()`, deletes on explicit button click, warning at 5MB.
