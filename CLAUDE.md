# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Hebrew (RTL) Kanban board for tracking development tasks for the **AI Travel Dashboard** project. Built with Vite + React 19, Tailwind CSS, and Firebase Firestore as the real-time backend. The board has 4 columns (פתיחה → לביצוע → בתהליך → הושלם), supports drag & drop between columns, and allows editing tasks via a modal.

The app lives in the `kanban/` subdirectory. All `npm` commands should be run from there.

## Commands

```bash
# Development
cd kanban && npm run dev

# Build
cd kanban && npm run build

# Lint
cd kanban && npm run lint

# Seed Firestore with initial users and tasks (run once)
cd seed && node seed.js
```

## Environment Setup

Create `kanban/.env.local` with Firebase credentials:
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

The seed script uses `seed/.env` with the same values (without the `VITE_` prefix).

## Architecture

### Data Flow
- `App.jsx` fetches users once on mount via `getUsers()`, then passes them down as props
- `Board.jsx` subscribes to all tasks via `onSnapshot` (real-time), grouping them by `status` into 4 columns
- Drag & drop triggers an optimistic local state update immediately, then writes the new `status` to Firestore
- Modal saves call `updateTask()` directly; the `onSnapshot` listener propagates changes to all clients

### Firestore Schema
- `/users` — `{ id, name (Hebrew), avatarUrl, avatarColor }`
- `/tasks` — `{ id, title (Hebrew), description, type (BE|FE|BOTH), priority (critical|high|medium|low), assigneeId, status (backlog|todo|in-progress|done), category, order }`

### Key Files
- `src/firebase/config.js` — Firebase app init, exports `db` and `storage`
- `src/firebase/tasks.js` — `subscribeTasks(callback)`, `updateTask(id, fields)`, `addTask(fields)`, `deleteTask(id)`
- `src/firebase/users.js` — `getUsers()` one-time fetch
- `src/constants/taskFields.js` — shared `PRIORITIES` and `TYPES` arrays used by TaskCard, TaskModal, and CreateTaskModal
- `src/components/Board.jsx` — owns task state, drag logic, and the edit/delete modal trigger

### RTL / Hebrew
The entire app is RTL. `index.html` has `<html lang="he" dir="rtl">`. Use Rubik font (loaded from Google Fonts). All user-visible text in the UI is Hebrew.

### No Auth
Firestore and Storage rules are open read/write for development. There is no authentication layer in the current codebase.

## Deployment

**Live URL:** https://kanban-phi-eight.vercel.app

**GitHub repo:** https://github.com/roei848/travel-kanban

### Auto-deploy (active)
The GitHub repo is connected to Vercel. Every `git push` to `master` triggers an automatic production deploy — no manual steps needed.

### Manual deploy via CLI
```bash
# One-time setup
npm install -g vercel
vercel login

# Deploy to production
cd kanban && vercel --prod
```

When adding env vars via CLI, always use `printf` (not `echo`) to avoid trailing newlines corrupting values:
```bash
printf 'value' | vercel env add VAR_NAME production
```
