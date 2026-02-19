import { useState, useEffect } from 'react'
import { Trash2 } from 'lucide-react'
import Avatar from './Avatar'
import { updateTask } from '../firebase/tasks'
import { PRIORITIES, TYPE_LABELS } from '../constants/taskFields'

export default function TaskModal({ task, users, onClose, onDelete }) {
  const [title, setTitle]           = useState(task.title)
  const [description, setDescription] = useState(task.description || '')
  const [priority, setPriority]     = useState(task.priority)
  const [assigneeId, setAssigneeId] = useState(task.assigneeId || '')
  const [saving, setSaving]         = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  // Close on Escape
  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  async function handleSave() {
    setSaving(true)
    try {
      await updateTask(task.id, {
        title,
        description,
        priority,
        assigneeId: assigneeId || null,
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 flex flex-col gap-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">פרטי משימה</h2>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setConfirmDelete(true)}
              className="text-gray-400 hover:text-red-500 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors"
              title="מחק משימה"
            >
              <Trash2 size={16} />
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl font-bold w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Meta badges */}
        <div className="flex items-center gap-2">
          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
            {task.category}
          </span>
          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
            {TYPE_LABELS[task.type] || task.type}
          </span>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">כותרת</label>
          <input
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 transition-shadow"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>

        {/* Extra instructions */}
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
        {confirmDelete ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex flex-col gap-2">
            <p className="text-sm text-red-700 font-medium">האם למחוק את המשימה? פעולה זו אינה הפיכה.</p>
            <div className="flex gap-2">
              <button
                onClick={onDelete}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors"
              >
                כן, מחק
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="border border-gray-200 text-gray-600 hover:bg-gray-50 px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors"
              >
                ביטול
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-3 pt-2">
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
        )}
      </div>
    </div>
  )
}
