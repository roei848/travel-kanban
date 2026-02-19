# Kanban Board — Design Document
**Date:** 2026-02-18
**Project:** AI Travel Dashboard — Task Management Kanban

---

## Overview

A Hebrew (RTL) Kanban board for tracking development tasks across a team of 5. Built with React + Firebase Firestore, featuring drag & drop, task detail modals, priority badges, type icons, and user avatars.

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Vite + React 18 |
| Styling | Tailwind CSS (RTL support via `dir="rtl"`) |
| Database | Firebase Firestore |
| File Storage | Firebase Storage (user avatars) |
| Drag & Drop | `@hello-pangea/dnd` |

---

## Firestore Schema

### `/users`
```json
{
  "id": "string",
  "name": "string (Hebrew)",
  "avatarUrl": "string (Firebase Storage URL)",
  "avatarColor": "string (hex, fallback if no image)"
}
```

### `/tasks`
```json
{
  "id": "string",
  "title": "string (Hebrew)",
  "description": "string (extra instructions, free text)",
  "type": "BE | FE | BOTH",
  "priority": "low | medium | high | critical",
  "assigneeId": "string (user id, nullable)",
  "status": "backlog | todo | in-progress | done",
  "category": "string (Hebrew category label)",
  "order": "number (position within column)"
}
```

### Firebase Storage
```
/avatars/{userId}.jpg   — one image per user
```

---

## Team (Users to Seed)

- מאסטר R&D
- אורבאכס
- שנשן
- בגי
- פורסט

---

## Kanban Columns

| Status | Hebrew Label |
|---|---|
| `backlog` | פתיחה |
| `todo` | לביצוע |
| `in-progress` | בתהליך |
| `done` | הושלם |

---

## UI/UX

### Board Layout
- RTL layout (`dir="rtl"` on `<html>`)
- Header bar: app title (Hebrew) + team avatars
- 4 columns side by side, independently scrollable

### Task Card
- Title (Hebrew)
- Type icon badge: BE (blue, server icon) / FE (purple, monitor icon) / Both (green, split icon)
- Priority badge with color coding
- Category label (subtle)
- Assignee avatar (bottom corner)
- Edit/pencil icon (top corner) — opens Task Modal
- Draggable between columns

### Priority Colors
| Priority | Color |
|---|---|
| Critical | Red |
| High | Orange |
| Medium | Yellow |
| Low | Green |

### Task Detail Modal
- Opens on: card click OR edit icon click
- Editable: title, extra instructions (textarea), priority (dropdown), assignee (dropdown)
- Save → updates Firestore
- Dismiss: close button or click outside

---

## Data Flow

1. App loads → fetch users + subscribe to tasks via `onSnapshot`
2. Tasks grouped by `status` into 4 column arrays
3. Drag card → optimistic UI update → write new `status` to Firestore
4. Modal save → update Firestore document → `onSnapshot` propagates to all clients

---

## File Structure

```
src/
  components/
    Board.jsx          — drag context, 4 columns
    Column.jsx         — droppable column
    TaskCard.jsx       — card UI with icons, badges, avatar, edit icon
    TaskModal.jsx      — detail/edit modal
    Avatar.jsx         — avatar image with color fallback
  firebase/
    config.js          — Firebase init
    tasks.js           — Firestore task CRUD + onSnapshot
    users.js           — Firestore user reads
    storage.js         — Firebase Storage upload helper
  seed/
    seed.js            — one-time Node script: upload avatars + seed users + tasks
  App.jsx
  main.jsx
```

---

## Seed Script

Run once to initialize Firestore:
1. Upload avatar images from local `/avatars/` folder to Firebase Storage
2. Save download URLs + user metadata to `/users`
3. Write all 50 tasks to `/tasks` with `status: "backlog"` as default

---

## Security

Firestore rules set to open read/write for development. Lock down with proper rules before any production deployment.

---

## Tasks to Seed (50 tasks across 6 categories)

### 1. תשתית, אבטחה ונתונים
| Title | Type | Priority |
|---|---|---|
| הקמת DB לשמירה | BE | Critical |
| התחברות דרך Google (מימוש לוגיקה) | Both | Critical |
| מסך התחברות (UI) | FE | High |
| כפתור Logout | FE | Medium |
| התחברות באמצעות מייל וסיסמא | Both | High |
| חיבור ל-AI דרך OpenRouter (Service) | BE | Critical |
| כתיבת Logs | BE | Low |
| שינוי Settings של יוזר | Both | Medium |
| תמיכה בעברית (RTL & AI Logic) | Both | High |
| אופטימיזציה של ה-DB (אינדקסים) | BE | Medium |
| אבטחת מפתחות API (Environment Variables) | BE | Critical |

### 2. ממשק משתמש וחווית שימוש
| Title | Type | Priority |
|---|---|---|
| עיצוב Cards לטיולים | FE | High |
| שימוש ב-Unsplash API לתמונות דינמיות | FE | Medium |
| Toggle מצב Dark/Light | FE | Low |
| טעינת Skeleton בזמן יצירה | FE | Medium |
| התאמה למובייל (Responsiveness) | FE | High |
| התמודדות עם שגיאות (Snackbar/Toasts) | FE | Medium |
| בנייה והוספת לוגו | FE | Low |
| נגישות (Accessibility & Aria tags) | FE | Low |

### 3. מנוע תכנון הטיול וה-AI
| Title | Type | Priority |
|---|---|---|
| טופס תכנון טיול מרכזי (ממשק משתמש) | FE | Critical |
| עיבוד פרמטרי טיול ושליחה ל-AI (לוגיקת שרת) | BE | Critical |
| מצב עריכה חכמה (AI Chat/Update) | Both | High |
| בקשה לבניית רשימת ציוד (Checklist) | Both | Medium |
| שילוב תחזית מזג אוויר | Both | Medium |
| מנוע חיפוש טיולים שמורים לפי שם | Both | Low |
| חיפוש/סינון לפי תאריך | Both | Low |
| הצעה ל"מסלול דומה" | BE | Low |
| ניתוח סנטימנט למקומות (ביקורות AI) | BE | Low |

### 4. מפות ואינטגרציות
| Title | Type | Priority |
|---|---|---|
| חיבור ל-Google Maps API | FE | High |
| הצגת Markers על המפה | FE | High |
| אייקונים ומספרים מקודדים במפה | FE | Medium |
| כרטיסים לאירועים - אינטגרציה (Ticketmaster) | BE | Medium |
| כרטיסים לאירועים - תצוגה בלו"ז | FE | Medium |
| חיבור ל-API של מלונות | Both | Medium |
| תצוגת Street View | FE | Low |

### 5. ניהול, עריכה וכלים
| Title | Type | Priority |
|---|---|---|
| מערכת ניהול הוצאות (הזנת עלויות) | Both | Medium |
| חישוב הוצאות משוער (תקציב כולל) | BE | Medium |
| שיתוף טיול דרך קישור ציבורי | Both | High |
| הזמנה לעריכה במייל (Multi-user) | Both | Medium |
| שינוי סדר אטרקציות (Drag & Drop) | FE | Medium |
| מצב עריכה ידנית (מחיקה/הוספה) | Both | High |
| ייצוא ל-PDF | FE | Medium |
| ייצוא ל-CSV | FE | Low |
| המרת מטבע דינמית | Both | Low |
| היסטוריית שינויים (Version Control) | BE | Low |

### 6. DevOps ואיכות
| Title | Type | Priority |
|---|---|---|
| העלאה ל-GH Pages / Deployment | FE | High |
| הגדרת ביקורת קוד אוטומטית (Claude Code) | BE | Low |
| טסט E2E עם Playwright | Both | Medium |
| חיבור ל-GitHub (CI/CD) | BE | High |
