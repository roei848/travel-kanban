# Kanban Board Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a Hebrew RTL Kanban board with Firebase Firestore, drag & drop, task modals, priority badges, type icons, and user avatars.

**Architecture:** Vite + React 18 SPA. All state lives in Firestore and is synced via `onSnapshot`. Drag & drop handled by `@hello-pangea/dnd`. No auth — open read/write in dev mode.

**Tech Stack:** Vite, React 18, Tailwind CSS, Firebase v10 (Firestore + Storage), `@hello-pangea/dnd`, Node.js (seed script)

---

## Task 1: Scaffold the Vite + React project

**Files:**
- Create: `package.json`, `vite.config.js`, `index.html`, `src/main.jsx`, `src/App.jsx`

**Step 1: Scaffold project**

```bash
cd /Users/roeicohen/my-projects/claude/ai-travel-dashboard
npm create vite@latest kanban -- --template react
cd kanban
npm install
```

**Step 2: Install all dependencies**

```bash
npm install firebase @hello-pangea/dnd
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**Step 3: Configure Tailwind**

Edit `tailwind.config.js`:
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: { extend: {} },
  plugins: [],
}
```

Edit `src/index.css` (replace entire file):
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**Step 4: Set RTL on HTML**

Edit `index.html` — change `<html lang="en">` to:
```html
<html lang="he" dir="rtl">
```

**Step 5: Clear App.jsx to minimal shell**

```jsx
export default function App() {
  return <div className="min-h-screen bg-gray-100 p-6">טוען...</div>
}
```

**Step 6: Run dev server and verify it starts**

```bash
npm run dev
```
Expected: browser shows "טוען..." with RTL layout (text right-aligned).

**Step 7: Commit**

```bash
git init
git add .
git commit -m "feat: scaffold Vite + React + Tailwind + Firebase project"
```

---

## Task 2: Firebase configuration

**Files:**
- Create: `src/firebase/config.js`
- Create: `.env.local` (gitignored)
- Modify: `.gitignore`

**Step 1: Create Firebase project**

Go to https://console.firebase.google.com → Create project → Enable Firestore (start in test mode) → Enable Storage (start in test mode).

Copy your Firebase config object (Project Settings → Your apps → Web app).

**Step 2: Create `.env.local`**

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

**Step 3: Add `.env.local` to `.gitignore`**

Append to `.gitignore`:
```
.env.local
```

**Step 4: Create `src/firebase/config.js`**

```js
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const storage = getStorage(app)
```

**Step 5: Verify no errors in browser console**

Restart `npm run dev`. Open browser console — no Firebase errors.

**Step 6: Commit**

```bash
git add src/firebase/config.js .gitignore
git commit -m "feat: add Firebase config with env vars"
```

---

## Task 3: Firestore users module

**Files:**
- Create: `src/firebase/users.js`

**Step 1: Create `src/firebase/users.js`**

```js
import { collection, getDocs } from 'firebase/firestore'
import { db } from './config'

export async function getUsers() {
  const snapshot = await getDocs(collection(db, 'users'))
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}
```

**Step 2: Commit**

```bash
git add src/firebase/users.js
git commit -m "feat: add Firestore users module"
```

---

## Task 4: Firestore tasks module

**Files:**
- Create: `src/firebase/tasks.js`

**Step 1: Create `src/firebase/tasks.js`**

```js
import {
  collection, onSnapshot, doc, updateDoc, query, orderBy
} from 'firebase/firestore'
import { db } from './config'

export function subscribeTasks(callback) {
  const q = query(collection(db, 'tasks'), orderBy('order'))
  return onSnapshot(q, snapshot => {
    const tasks = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
    callback(tasks)
  })
}

export async function updateTask(id, fields) {
  await updateDoc(doc(db, 'tasks', id), fields)
}
```

**Step 2: Commit**

```bash
git add src/firebase/tasks.js
git commit -m "feat: add Firestore tasks module with onSnapshot"
```

---

## Task 5: Firebase Storage module

**Files:**
- Create: `src/firebase/storage.js`

**Step 1: Create `src/firebase/storage.js`**

```js
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from './config'

export async function uploadAvatar(userId, file) {
  const storageRef = ref(storage, `avatars/${userId}`)
  await uploadBytes(storageRef, file)
  return getDownloadURL(storageRef)
}
```

**Step 2: Commit**

```bash
git add src/firebase/storage.js
git commit -m "feat: add Firebase Storage upload helper"
```

---

## Task 6: Seed script — users + tasks

**Files:**
- Create: `seed/seed.js`
- Create: `seed/package.json`
- Create: `seed/avatars/` (folder — place user images here before running)
- Create: `seed/.env` (same Firebase credentials as .env.local)

**Step 1: Create `seed/package.json`**

```json
{
  "name": "kanban-seed",
  "type": "module",
  "dependencies": {
    "firebase": "^10.0.0",
    "firebase-admin": "^12.0.0",
    "dotenv": "^16.0.0"
  }
}
```

**Step 2: Create `seed/.env`**

```
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
```

**Step 3: Create `seed/seed.js`**

```js
import 'dotenv/config'
import { initializeApp } from 'firebase/app'
import { getFirestore, setDoc, doc } from 'firebase/firestore'
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

const app = initializeApp({
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
})

const db = getFirestore(app)
const storage = getStorage(app)

// --- USERS ---
const USERS = [
  { id: 'master-rd',  name: 'מאסטר R&D', avatarColor: '#6366f1' },
  { id: 'aurbachs',   name: 'אורבאכס',   avatarColor: '#f59e0b' },
  { id: 'shanshan',   name: 'שנשן',       avatarColor: '#10b981' },
  { id: 'bagi',       name: 'בגי',        avatarColor: '#ef4444' },
  { id: 'forest',     name: 'פורסט',      avatarColor: '#8b5cf6' },
]

// --- TASKS ---
const TASKS = [
  // Category 1: תשתית, אבטחה ונתונים
  { title: 'הקמת DB לשמירה',                           type: 'BE',   priority: 'critical', category: 'תשתית, אבטחה ונתונים' },
  { title: 'התחברות דרך Google (מימוש לוגיקה)',         type: 'BOTH', priority: 'critical', category: 'תשתית, אבטחה ונתונים' },
  { title: 'מסך התחברות (UI)',                          type: 'FE',   priority: 'high',     category: 'תשתית, אבטחה ונתונים' },
  { title: 'כפתור Logout',                              type: 'FE',   priority: 'medium',   category: 'תשתית, אבטחה ונתונים' },
  { title: 'התחברות באמצעות מייל וסיסמא',              type: 'BOTH', priority: 'high',     category: 'תשתית, אבטחה ונתונים' },
  { title: 'חיבור ל-AI דרך OpenRouter (Service)',       type: 'BE',   priority: 'critical', category: 'תשתית, אבטחה ונתונים' },
  { title: 'כתיבת Logs',                               type: 'BE',   priority: 'low',      category: 'תשתית, אבטחה ונתונים' },
  { title: 'שינוי Settings של יוזר',                   type: 'BOTH', priority: 'medium',   category: 'תשתית, אבטחה ונתונים' },
  { title: 'תמיכה בעברית (RTL & AI Logic)',             type: 'BOTH', priority: 'high',     category: 'תשתית, אבטחה ונתונים' },
  { title: 'אופטימיזציה של ה-DB (אינדקסים)',           type: 'BE',   priority: 'medium',   category: 'תשתית, אבטחה ונתונים' },
  { title: 'אבטחת מפתחות API (Environment Variables)', type: 'BE',   priority: 'critical', category: 'תשתית, אבטחה ונתונים' },

  // Category 2: ממשק משתמש וחווית שימוש
  { title: 'עיצוב Cards לטיולים',                      type: 'FE',   priority: 'high',   category: 'ממשק משתמש וחווית שימוש' },
  { title: 'שימוש ב-Unsplash API לתמונות דינמיות',     type: 'FE',   priority: 'medium', category: 'ממשק משתמש וחווית שימוש' },
  { title: 'Toggle מצב Dark/Light',                    type: 'FE',   priority: 'low',    category: 'ממשק משתמש וחווית שימוש' },
  { title: 'טעינת Skeleton בזמן יצירה',                type: 'FE',   priority: 'medium', category: 'ממשק משתמש וחווית שימוש' },
  { title: 'התאמה למובייל (Responsiveness)',            type: 'FE',   priority: 'high',   category: 'ממשק משתמש וחווית שימוש' },
  { title: 'התמודדות עם שגיאות (Snackbar/Toasts)',     type: 'FE',   priority: 'medium', category: 'ממשק משתמש וחווית שימוש' },
  { title: 'בנייה והוספת לוגו',                        type: 'FE',   priority: 'low',    category: 'ממשק משתמש וחווית שימוש' },
  { title: 'נגישות (Accessibility & Aria tags)',        type: 'FE',   priority: 'low',    category: 'ממשק משתמש וחווית שימוש' },

  // Category 3: מנוע תכנון הטיול וה-AI
  { title: 'טופס תכנון טיול מרכזי (ממשק משתמש)',       type: 'FE',   priority: 'critical', category: 'מנוע תכנון הטיול וה-AI' },
  { title: 'עיבוד פרמטרי טיול ושליחה ל-AI (לוגיקת שרת)', type: 'BE', priority: 'critical', category: 'מנוע תכנון הטיול וה-AI' },
  { title: 'מצב עריכה חכמה (AI Chat/Update)',           type: 'BOTH', priority: 'high',     category: 'מנוע תכנון הטיול וה-AI' },
  { title: 'בקשה לבניית רשימת ציוד (Checklist)',        type: 'BOTH', priority: 'medium',   category: 'מנוע תכנון הטיול וה-AI' },
  { title: 'שילוב תחזית מזג אוויר',                    type: 'BOTH', priority: 'medium',   category: 'מנוע תכנון הטיול וה-AI' },
  { title: 'מנוע חיפוש טיולים שמורים לפי שם',          type: 'BOTH', priority: 'low',      category: 'מנוע תכנון הטיול וה-AI' },
  { title: 'חיפוש/סינון לפי תאריך',                    type: 'BOTH', priority: 'low',      category: 'מנוע תכנון הטיול וה-AI' },
  { title: 'הצעה ל"מסלול דומה"',                       type: 'BE',   priority: 'low',      category: 'מנוע תכנון הטיול וה-AI' },
  { title: 'ניתוח סנטימנט למקומות (ביקורות AI)',        type: 'BE',   priority: 'low',      category: 'מנוע תכנון הטיול וה-AI' },

  // Category 4: מפות ואינטגרציות
  { title: 'חיבור ל-Google Maps API',                  type: 'FE',   priority: 'high',   category: 'מפות ואינטגרציות' },
  { title: 'הצגת Markers על המפה',                     type: 'FE',   priority: 'high',   category: 'מפות ואינטגרציות' },
  { title: 'אייקונים ומספרים מקודדים במפה',            type: 'FE',   priority: 'medium', category: 'מפות ואינטגרציות' },
  { title: 'כרטיסים לאירועים - אינטגרציה (Ticketmaster)', type: 'BE', priority: 'medium', category: 'מפות ואינטגרציות' },
  { title: 'כרטיסים לאירועים - תצוגה בלו"ז',          type: 'FE',   priority: 'medium', category: 'מפות ואינטגרציות' },
  { title: 'חיבור ל-API של מלונות',                    type: 'BOTH', priority: 'medium', category: 'מפות ואינטגרציות' },
  { title: 'תצוגת Street View',                        type: 'FE',   priority: 'low',    category: 'מפות ואינטגרציות' },

  // Category 5: ניהול, עריכה וכלים
  { title: 'מערכת ניהול הוצאות (הזנת עלויות)',         type: 'BOTH', priority: 'medium', category: 'ניהול, עריכה וכלים' },
  { title: 'חישוב הוצאות משוער (תקציב כולל)',          type: 'BE',   priority: 'medium', category: 'ניהול, עריכה וכלים' },
  { title: 'שיתוף טיול דרך קישור ציבורי',             type: 'BOTH', priority: 'high',   category: 'ניהול, עריכה וכלים' },
  { title: 'הזמנה לעריכה במייל (Multi-user)',          type: 'BOTH', priority: 'medium', category: 'ניהול, עריכה וכלים' },
  { title: 'שינוי סדר אטרקציות (Drag & Drop)',         type: 'FE',   priority: 'medium', category: 'ניהול, עריכה וכלים' },
  { title: 'מצב עריכה ידנית (מחיקה/הוספה)',            type: 'BOTH', priority: 'high',   category: 'ניהול, עריכה וכלים' },
  { title: 'ייצוא ל-PDF',                              type: 'FE',   priority: 'medium', category: 'ניהול, עריכה וכלים' },
  { title: 'ייצוא ל-CSV',                              type: 'FE',   priority: 'low',    category: 'ניהול, עריכה וכלים' },
  { title: 'המרת מטבע דינמית',                         type: 'BOTH', priority: 'low',    category: 'ניהול, עריכה וכלים' },
  { title: 'היסטוריית שינויים (Version Control)',       type: 'BE',   priority: 'low',    category: 'ניהול, עריכה וכלים' },

  // Category 6: DevOps ואיכות
  { title: 'העלאה ל-GH Pages / Deployment',            type: 'FE',   priority: 'high',   category: 'DevOps ואיכות' },
  { title: 'הגדרת ביקורת קוד אוטומטית (Claude Code)', type: 'BE',   priority: 'low',    category: 'DevOps ואיכות' },
  { title: 'טסט E2E עם Playwright',                    type: 'BOTH', priority: 'medium', category: 'DevOps ואיכות' },
  { title: 'חיבור ל-GitHub (CI/CD)',                   type: 'BE',   priority: 'high',   category: 'DevOps ואיכות' },
]

async function uploadAvatarAndGetUrl(user) {
  const extensions = ['jpg', 'jpeg', 'png', 'webp']
  for (const ext of extensions) {
    const path = resolve(`avatars/${user.id}.${ext}`)
    if (existsSync(path)) {
      const file = readFileSync(path)
      const storageRef = ref(storage, `avatars/${user.id}`)
      await uploadBytes(storageRef, file)
      return getDownloadURL(storageRef)
    }
  }
  return null // no image found, will use avatarColor fallback
}

async function seedUsers() {
  console.log('Seeding users...')
  for (const user of USERS) {
    const avatarUrl = await uploadAvatarAndGetUrl(user)
    await setDoc(doc(db, 'users', user.id), {
      name: user.name,
      avatarColor: user.avatarColor,
      avatarUrl: avatarUrl || null,
    })
    console.log(`  ✓ ${user.name} (avatar: ${avatarUrl ? 'uploaded' : 'color fallback'})`)
  }
}

async function seedTasks() {
  console.log('Seeding tasks...')
  for (let i = 0; i < TASKS.length; i++) {
    const task = TASKS[i]
    await setDoc(doc(db, 'tasks', `task-${String(i + 1).padStart(3, '0')}`), {
      title: task.title,
      description: '',
      type: task.type,
      priority: task.priority,
      category: task.category,
      assigneeId: null,
      status: 'backlog',
      order: i,
    })
    console.log(`  ✓ [${task.type}] ${task.title}`)
  }
}

async function main() {
  await seedUsers()
  await seedTasks()
  console.log('\nDone! All users and tasks seeded.')
  process.exit(0)
}

main().catch(err => { console.error(err); process.exit(1) })
```

**Step 4: Place avatar images**

Create folder `seed/avatars/` and add images named by user ID:
- `master-rd.jpg`
- `aurbachs.jpg`
- `shanshan.jpg`
- `bagi.jpg`
- `forest.jpg`

(Any common image format works: jpg, jpeg, png, webp)

**Step 5: Install seed dependencies and run**

```bash
cd seed
npm install
node seed.js
```

Expected output:
```
Seeding users...
  ✓ מאסטר R&D (avatar: uploaded)
  ...
Seeding tasks...
  ✓ [BE] הקמת DB לשמירה
  ...
Done! All users and tasks seeded.
```

**Step 6: Verify in Firebase Console**

Open Firestore → check `/users` (5 docs) and `/tasks` (50 docs) exist.

**Step 7: Commit**

```bash
cd ..
git add seed/
git commit -m "feat: add seed script for users and tasks"
```

---

## Task 7: Avatar component

**Files:**
- Create: `src/components/Avatar.jsx`

**Step 1: Create `src/components/Avatar.jsx`**

```jsx
export default function Avatar({ user, size = 'sm' }) {
  const sizes = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-12 h-12 text-base' }
  const cls = `${sizes[size]} rounded-full flex items-center justify-center font-bold text-white overflow-hidden flex-shrink-0`

  if (user?.avatarUrl) {
    return <img src={user.avatarUrl} alt={user.name} className={`${sizes[size]} rounded-full object-cover flex-shrink-0`} />
  }

  return (
    <div className={cls} style={{ backgroundColor: user?.avatarColor || '#94a3b8' }}>
      {user?.name?.[0] || '?'}
    </div>
  )
}
```

**Step 2: Verify in browser**

Temporarily render `<Avatar user={{ name: 'בגי', avatarColor: '#ef4444' }} />` in `App.jsx`. Confirm the avatar circle with Hebrew initial shows.

**Step 3: Commit**

```bash
git add src/components/Avatar.jsx
git commit -m "feat: add Avatar component with image and color fallback"
```

---

## Task 8: TaskCard component

**Files:**
- Create: `src/components/TaskCard.jsx`

**Step 1: Create `src/components/TaskCard.jsx`**

```jsx
import { Draggable } from '@hello-pangea/dnd'
import Avatar from './Avatar'

const PRIORITY_STYLES = {
  critical: { bg: 'bg-red-100 text-red-700',    label: 'קריטי' },
  high:     { bg: 'bg-orange-100 text-orange-700', label: 'גבוה' },
  medium:   { bg: 'bg-yellow-100 text-yellow-700', label: 'בינוני' },
  low:      { bg: 'bg-green-100 text-green-700',   label: 'נמוך' },
}

const TYPE_STYLES = {
  BE:   { bg: 'bg-blue-100 text-blue-700',   label: 'BE' },
  FE:   { bg: 'bg-purple-100 text-purple-700', label: 'FE' },
  BOTH: { bg: 'bg-green-100 text-green-700',  label: 'BE+FE' },
}

export default function TaskCard({ task, index, users, onEdit }) {
  const priority = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.medium
  const type = TYPE_STYLES[task.type] || TYPE_STYLES.FE
  const assignee = users.find(u => u.id === task.assigneeId)

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onEdit(task)}
          className={`bg-white rounded-xl p-3 shadow-sm border border-gray-100 cursor-pointer select-none
            hover:shadow-md transition-shadow relative
            ${snapshot.isDragging ? 'shadow-lg rotate-1 scale-105' : ''}`}
        >
          {/* Edit icon */}
          <button
            onClick={e => { e.stopPropagation(); onEdit(task) }}
            className="absolute top-2 left-2 text-gray-400 hover:text-gray-600 text-sm p-1"
            aria-label="ערוך משימה"
          >
            ✏️
          </button>

          {/* Type + Priority badges */}
          <div className="flex items-center gap-1.5 mb-2 flex-wrap">
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${type.bg}`}>{type.label}</span>
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${priority.bg}`}>{priority.label}</span>
          </div>

          {/* Title */}
          <p className="text-sm font-medium text-gray-800 leading-snug mb-2 pl-6">{task.title}</p>

          {/* Category + Assignee */}
          <div className="flex items-center justify-between mt-2">
            <span className="text-[10px] text-gray-400 truncate ml-1">{task.category}</span>
            {assignee && <Avatar user={assignee} size="sm" />}
          </div>
        </div>
      )}
    </Draggable>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/TaskCard.jsx
git commit -m "feat: add TaskCard component with drag, badges, and avatar"
```

---

## Task 9: Column component

**Files:**
- Create: `src/components/Column.jsx`

**Step 1: Create `src/components/Column.jsx`**

```jsx
import { Droppable } from '@hello-pangea/dnd'
import TaskCard from './TaskCard'

const COLUMN_COLORS = {
  backlog:     'border-gray-300',
  todo:        'border-blue-300',
  'in-progress': 'border-yellow-400',
  done:        'border-green-400',
}

export default function Column({ column, tasks, users, onEdit }) {
  return (
    <div className={`flex flex-col bg-gray-50 rounded-2xl border-2 ${COLUMN_COLORS[column.id]} min-w-[270px] w-[270px] max-h-[calc(100vh-120px)]`}>
      {/* Column header */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <h2 className="font-bold text-gray-700 text-base">{column.label}</h2>
        <span className="bg-gray-200 text-gray-600 text-xs font-semibold rounded-full px-2 py-0.5">
          {tasks.length}
        </span>
      </div>

      {/* Cards */}
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 overflow-y-auto px-3 pb-3 flex flex-col gap-2 min-h-[100px]
              ${snapshot.isDraggingOver ? 'bg-blue-50 rounded-b-2xl' : ''}`}
          >
            {tasks.map((task, index) => (
              <TaskCard key={task.id} task={task} index={index} users={users} onEdit={onEdit} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/Column.jsx
git commit -m "feat: add Column component with Droppable"
```

---

## Task 10: TaskModal component

**Files:**
- Create: `src/components/TaskModal.jsx`

**Step 1: Create `src/components/TaskModal.jsx`**

```jsx
import { useState, useEffect } from 'react'
import { updateTask } from '../firebase/tasks'
import Avatar from './Avatar'

const PRIORITIES = [
  { value: 'critical', label: 'קריטי' },
  { value: 'high',     label: 'גבוה' },
  { value: 'medium',   label: 'בינוני' },
  { value: 'low',      label: 'נמוך' },
]

export default function TaskModal({ task, users, onClose }) {
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description || '')
  const [priority, setPriority] = useState(task.priority)
  const [assigneeId, setAssigneeId] = useState(task.assigneeId || '')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  async function handleSave() {
    setSaving(true)
    await updateTask(task.id, {
      title,
      description,
      priority,
      assigneeId: assigneeId || null,
    })
    setSaving(false)
    onClose()
  }

  const selectedUser = users.find(u => u.id === assigneeId)

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">פרטי משימה</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold">✕</button>
        </div>

        {/* Category badge */}
        <span className="text-xs text-gray-500">{task.category}</span>

        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">כותרת</label>
          <input
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>

        {/* Instructions */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">הוראות נוספות</label>
          <textarea
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
            rows={4}
            placeholder="הוסף הוראות, הערות, או הקשר למשימה..."
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">עדיפות</label>
          <select
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            value={priority}
            onChange={e => setPriority(e.target.value)}
          >
            {PRIORITIES.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>

        {/* Assignee */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">משויך ל</label>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setAssigneeId('')}
              className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${assigneeId === '' ? 'border-blue-400 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500'}`}
            >
              ללא שיוך
            </button>
            {users.map(user => (
              <button
                key={user.id}
                onClick={() => setAssigneeId(user.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border transition-colors
                  ${assigneeId === user.id ? 'border-blue-400 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600'}`}
              >
                <Avatar user={user} size="sm" />
                {user.name}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-start pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-semibold disabled:opacity-60 transition-colors"
          >
            {saving ? 'שומר...' : 'שמור'}
          </button>
          <button
            onClick={onClose}
            className="border border-gray-200 text-gray-600 hover:bg-gray-50 px-5 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            ביטול
          </button>
        </div>
      </div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/TaskModal.jsx
git commit -m "feat: add TaskModal with editable title, instructions, priority, assignee"
```

---

## Task 11: Board component

**Files:**
- Create: `src/components/Board.jsx`

**Step 1: Create `src/components/Board.jsx`**

```jsx
import { useState, useEffect } from 'react'
import { DragDropContext } from '@hello-pangea/dnd'
import Column from './Column'
import TaskModal from './TaskModal'
import { subscribeTasks, updateTask } from '../firebase/tasks'

const COLUMNS = [
  { id: 'backlog',      label: 'פתיחה' },
  { id: 'todo',         label: 'לביצוע' },
  { id: 'in-progress',  label: 'בתהליך' },
  { id: 'done',         label: 'הושלם' },
]

export default function Board({ users }) {
  const [tasks, setTasks] = useState([])
  const [editingTask, setEditingTask] = useState(null)

  useEffect(() => {
    const unsubscribe = subscribeTasks(setTasks)
    return unsubscribe
  }, [])

  function getColumnTasks(columnId) {
    return tasks.filter(t => t.status === columnId)
  }

  async function onDragEnd(result) {
    const { destination, source, draggableId } = result
    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) return

    // Optimistic update
    setTasks(prev =>
      prev.map(t =>
        t.id === draggableId ? { ...t, status: destination.droppableId } : t
      )
    )

    await updateTask(draggableId, { status: destination.droppableId })
  }

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map(col => (
            <Column
              key={col.id}
              column={col}
              tasks={getColumnTasks(col.id)}
              users={users}
              onEdit={setEditingTask}
            />
          ))}
        </div>
      </DragDropContext>

      {editingTask && (
        <TaskModal
          task={editingTask}
          users={users}
          onClose={() => setEditingTask(null)}
        />
      )}
    </>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/Board.jsx
git commit -m "feat: add Board with DragDropContext and real-time Firestore subscription"
```

---

## Task 12: App.jsx — wire everything together

**Files:**
- Modify: `src/App.jsx`

**Step 1: Update `src/App.jsx`**

```jsx
import { useState, useEffect } from 'react'
import Board from './components/Board'
import Avatar from './components/Avatar'
import { getUsers } from './firebase/users'

export default function App() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getUsers().then(data => {
      setUsers(data)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500 text-lg">טוען לוח...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <h1 className="text-xl font-bold text-gray-800">לוח משימות — AI Travel Dashboard</h1>
        <div className="flex items-center gap-2">
          {users.map(user => (
            <div key={user.id} title={user.name}>
              <Avatar user={user} size="md" />
            </div>
          ))}
        </div>
      </header>

      {/* Board */}
      <main className="p-6">
        <Board users={users} />
      </main>
    </div>
  )
}
```

**Step 2: Run dev server and verify**

```bash
npm run dev
```

Expected:
- Header shows Hebrew title + 5 team member avatars
- 4 columns visible (פתיחה, לביצוע, בתהליך, הושלם)
- All 50 tasks appear in "פתיחה" column
- Drag a card between columns → it moves, Firestore updates
- Click a card → modal opens with editable fields
- Save in modal → card updates in real time

**Step 3: Commit**

```bash
git add src/App.jsx
git commit -m "feat: wire App with header, users, and Board"
```

---

## Task 13: Final polish

**Files:**
- Modify: `src/main.jsx` (import styles)
- Modify: `index.html` (font)

**Step 1: Add Hebrew-friendly font to `index.html`**

Add inside `<head>`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;600;700&display=swap" rel="stylesheet">
```

**Step 2: Apply font globally in `src/index.css`**

Append after the Tailwind directives:
```css
body {
  font-family: 'Rubik', sans-serif;
}
```

**Step 3: Verify full app in browser**

- RTL layout renders correctly (text right-aligned, columns flow right to left)
- Rubik font applied throughout
- Drag and drop works smoothly
- Modal opens/closes correctly (Escape key, click outside, close button)
- All badges (type, priority) render with correct colors
- Avatars show images or color initials

**Step 4: Final commit**

```bash
git add .
git commit -m "feat: complete Hebrew RTL Kanban board"
```

---

## Done

The Kanban board is fully implemented. To run:

```bash
cd kanban
npm run dev
```

To reseed data (if needed):
```bash
cd seed
node seed.js
```
