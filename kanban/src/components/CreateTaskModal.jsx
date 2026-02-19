import { useState, useEffect } from 'react'
import Avatar from './Avatar'
import { addTask } from '../firebase/tasks'
import { PRIORITIES, TYPES } from '../constants/taskFields'

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
    try {
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
