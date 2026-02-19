# AI Travel Dashboard — Kanban Board

A Hebrew (RTL) Kanban board for tracking development tasks for the AI Travel Dashboard project.

Built with **Vite + React 19**, **Tailwind CSS**, and **Firebase Firestore** as the real-time backend.

## Features

- 4-column workflow: פתיחה → לביצוע → בתהליך → הושלם
- Drag & drop tasks between columns
- Create new tasks via modal
- Edit task title, description, priority, and assignee
- Delete tasks with two-step confirmation
- Real-time updates via Firestore `onSnapshot`
- Full RTL / Hebrew UI using the Rubik font

## Tech Stack

| Layer | Technology |
|---|---|
| UI | React 19, Tailwind CSS, lucide-react |
| Drag & Drop | @hello-pangea/dnd |
| Backend | Firebase Firestore |
| Build | Vite |

## Getting Started

### 1. Install dependencies

```bash
cd kanban && npm install
```

### 2. Configure Firebase

Create `kanban/.env.local`:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### 3. Seed initial data (run once)

```bash
cd seed && node seed.js
```

### 4. Start the dev server

```bash
cd kanban && npm run dev
```

## Project Structure

```
kanban/
├── src/
│   ├── components/
│   │   ├── Board.jsx          # Owns task state, drag logic, modal triggers
│   │   ├── Column.jsx         # Single Kanban column
│   │   ├── TaskCard.jsx       # Draggable task card
│   │   ├── TaskModal.jsx      # Edit/delete modal
│   │   ├── CreateTaskModal.jsx# New task modal
│   │   └── Avatar.jsx         # User avatar
│   ├── firebase/
│   │   ├── config.js          # Firebase app init
│   │   ├── tasks.js           # subscribeTasks, updateTask, addTask, deleteTask
│   │   └── users.js           # getUsers
│   └── constants/
│       └── taskFields.js      # Shared PRIORITIES and TYPES
└── seed/                      # Firestore seed scripts
```

## Firestore Schema

**`/users`** — `{ id, name, avatarUrl, avatarColor }`

**`/tasks`** — `{ id, title, description, type (BE|FE|BOTH), priority (critical|high|medium|low), assigneeId, status (backlog|todo|in-progress|done), category, order }`
