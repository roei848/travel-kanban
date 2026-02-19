# Progress Dashboard — Design Document
**Date:** 2026-02-18
**Project:** AI Travel Dashboard — Kanban Build Progress Tracker

---

## Overview

A read-only live progress dashboard that visualizes `progress.json` as the Kanban board is being built. Two files: a Python server and an HTML page.

---

## Architecture

```
../progress.json
    ↓
dashboard/dashboard_server.py  (reads & transforms on each request)
    ↓
/api/progress  (standard JSON shape)
    ↓
dashboard/dashboard.html  (polls every 15s, renders)
```

---

## Data Flow

1. `dashboard_server.py` starts on port 8765
2. Browser opens `http://localhost:8765`
3. Server serves `dashboard.html` at `/`
4. HTML fetches `/api/progress` on load and every 15 seconds
5. Server reads `../progress.json` fresh on each request, transforms to standard shape
6. HTML renders stats + task columns

---

## API Contract (`/api/progress`)

```json
{
  "lastUpdated": "2026-02-18",
  "project": "Hebrew RTL Kanban Board",
  "stats": {
    "total": 13,
    "completed": 0,
    "inProgress": 0,
    "todo": 13,
    "progressPercent": 0
  },
  "tasks": {
    "done": [],
    "inProgress": [],
    "todo": [{ "id": 1, "name": "Scaffold Vite + React project" }]
  }
}
```

---

## Status Mapping

| progress.json `status` | API bucket |
|---|---|
| `"pending"` | `todo` |
| `"in-progress"` | `inProgress` |
| `"done"` | `done` |

---

## UI

- **Header:** project name + last updated timestamp
- **Progress bar:** % complete (done / total)
- **Stat cards:** Total / Done / In Progress / To Do
- **Task columns:** To Do | In Progress | Done — cards showing task ID + name
- **Auto-refresh:** every 15 seconds
- **Error state:** banner if `/api/progress` fails

---

## Files

| File | Purpose |
|---|---|
| `dashboard/dashboard_server.py` | Python http.server, ~100 lines |
| `dashboard/dashboard.html` | Single-file HTML+CSS+JS, ~350 lines |

---

## Usage

```bash
cd dashboard
python3 dashboard_server.py
# Open http://localhost:8765
```
