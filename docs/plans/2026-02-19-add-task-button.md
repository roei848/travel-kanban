# Add New Task Button Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a board-level "+ משימה חדשה" button that opens a creation modal mirroring the existing edit modal; new tasks always land in the backlog column.

**Architecture:** A new `CreateTaskModal` component handles task creation independently from the existing `TaskModal` (which handles editing). `Board.jsx` owns the `showCreate` state and renders the button + modal. A new `addTask` function is added to the Firebase tasks module.

**Tech Stack:** React 19, Firebase Firestore (`addDoc`), Tailwind CSS, Vite dev server

---

### Task 1: Add `addTask` to Firebase tasks module

**Files:**
- Modify: `kanban/src/firebase/tasks.js`

**Step 1: Open the file and understand current exports**

Read `kanban/src/firebase/tasks.js`. It currently exports `subscribeTasks` and `updateTask`. You'll add `addTask` alongside them.

**Step 2: Add the `addTask` function**

Add `addDoc` to the existing import, then add the function at the bottom of the file:

```js
import {
  collection, onSnapshot, doc, updateDoc, addDoc, query, orderBy
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

export async function addTask(fields) {
  await addDoc(collection(db, 'tasks'), fields)
}
```

**Step 3: Verify the dev server still compiles**

Run: `cd kanban && npm run dev`
Expected: No errors in terminal, app loads in browser.

**Step 4: Commit**

```bash
git add kanban/src/firebase/tasks.js
git commit -m "feat: add addTask function to firebase tasks module"
```

---

### Task 2: Create `CreateTaskModal` component

**Files:**
- Create: `kanban/src/components/CreateTaskModal.jsx`

**Step 1: Create the file with this full implementation**

```jsx
import { useState, useEffect } from 'react'
import { addTask } from '../firebase/tasks'
import Avatar from './Avatar'

const PRIORITIES = [
  { value: 'critical', label: 'קריטי' },
  { value: 'high',     label: 'גבוה' },
  { value: 'medium',   label: 'בינוני' },
  { value: 'low',      label: 'נמוך' },
]

const TYPES = [
  { value: 'FE',   label: 'FE' },
  { value: 'BE',   label: 'BE' },
  { value: 'BOTH', label: 'BE+FE' },
]

export default function CreateTaskModal({ users, onClose }) {
  const [title, setTitle]           = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory]     = useState('general')
  const [type, setType]             = useState('FE')
  const [priority, setPriority]     = useState('low')
  const [assigneeId, setAssigneeId] = useState('')
  const [saving, setSaving]         = useState(false)

  // Close on Escape
  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  async function handleCreate() {
    if (!title.trim()) return
    setSaving(true)
    await addTask({
      title: title.trim(),
      description,
      category,
      type,
      priority,
      assigneeId: assigneeId || null,
      status: 'backlog',
      order: Date.now(),
    })
    setSaving(false)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 flex flex-col gap-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">משימה חדשה</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">כותרת</label>
          <input
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 transition-shadow"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="שם המשימה..."
            autoFocus
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">הוראות נוספות</label>
          <textarea
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none transition-shadow"
            rows={4}
            placeholder="הוסף הוראות, הערות, או הקשר למשימה..."
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">קטגוריה</label>
          <input
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 transition-shadow"
            value={category}
            onChange={e => setCategory(e.target.value)}
            placeholder="general"
          />
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">סוג</label>
          <select
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 transition-shadow"
            value={type}
            onChange={e => setType(e.target.value)}
          >
            {TYPES.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">עדיפות</label>
          <select
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 transition-shadow"
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
              className={`px-3 py-1.5 rounded-lg text-sm border transition-colors
                ${assigneeId === ''
                  ? 'border-blue-400 bg-blue-50 text-blue-700'
                  : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
            >
              ללא שיוך
            </button>
            {users.map(user => (
              <button
                key={user.id}
                onClick={() => setAssigneeId(user.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border transition-colors
                  ${assigneeId === user.id
                    ? 'border-blue-400 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              >
                <Avatar user={user} size="sm" />
                {user.name}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={handleCreate}
            disabled={saving || !title.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-semibold disabled:opacity-60 transition-colors"
          >
            {saving ? 'יוצר...' : 'צור משימה'}
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

**Step 2: Verify the dev server compiles**

Check browser — no console errors, no broken imports.

**Step 3: Commit**

```bash
git add kanban/src/components/CreateTaskModal.jsx
git commit -m "feat: add CreateTaskModal component"
```

---

### Task 3: Wire up button and modal in `Board.jsx`

**Files:**
- Modify: `kanban/src/components/Board.jsx`

**Step 1: Add `showCreate` state and import `CreateTaskModal`**

At the top of `Board.jsx`, add the import:
```js
import CreateTaskModal from './CreateTaskModal'
```

In the `Board` component body, add state alongside the existing `editingTask` state:
```js
const [showCreate, setShowCreate] = useState(false)
```

**Step 2: Add the button above the columns**

Replace the current return block's outer `<>` fragment with this updated version. The only additions are the header div with the button and the `<CreateTaskModal>` conditional render:

```jsx
return (
  <>
    {/* Board header with "add task" button */}
    <div className="flex justify-end mb-3">
      <button
        onClick={() => setShowCreate(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
      >
        + משימה חדשה
      </button>
    </div>

    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 pb-4 w-full">
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

    {showCreate && (
      <CreateTaskModal
        users={users}
        onClose={() => setShowCreate(false)}
      />
    )}
  </>
)
```

**Step 3: Manually verify the full flow**

1. Click "+ משימה חדשה" — modal opens with empty title, defaults set (type: FE, priority: נמוך)
2. Leave title empty — "צור משימה" button is disabled
3. Type a title — button becomes active
4. Fill in fields, click "צור משימה" — modal closes, new card appears in the "פתיחה" column
5. Click the new card — edit modal opens and shows the saved data
6. Press Escape while modal is open — modal closes
7. Click outside modal backdrop — modal closes

**Step 4: Commit**

```bash
git add kanban/src/components/Board.jsx
git commit -m "feat: wire up add-task button and CreateTaskModal in Board"
```
