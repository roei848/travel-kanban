import { useState, useEffect, useMemo } from 'react'
import { DragDropContext } from '@hello-pangea/dnd'
import Column from './Column'
import TaskModal from './TaskModal'
import CreateTaskModal from './CreateTaskModal'
import FilterBar from './FilterBar'
import { subscribeTasks, updateTask, deleteTask } from '../firebase/tasks'
import { PRIORITY_ORDER } from '../constants/taskFields'

const COLUMNS = [
  { id: 'backlog',       label: 'פתיחה' },
  { id: 'todo',          label: 'לביצוע' },
  { id: 'in-progress',   label: 'בתהליך' },
  { id: 'done',          label: 'הושלם' },
]

const EMPTY_FILTERS = { priority: '', type: '', assigneeId: '', category: '' }

export default function Board({ users, showCreate, setShowCreate }) {
  const [tasks, setTasks]             = useState([])
  const [editingTask, setEditingTask] = useState(null)
  const [filters, setFilters]         = useState(EMPTY_FILTERS)

  useEffect(() => {
    const unsubscribe = subscribeTasks(setTasks)
    return unsubscribe
  }, [])

  const categories = useMemo(
    () => [...new Set(tasks.map(t => t.category).filter(Boolean))].sort(),
    [tasks]
  )

  function getColumnTasks(columnId) {
    return tasks
      .filter(t => {
        if (t.status !== columnId)                                     return false
        if (filters.priority   && t.priority   !== filters.priority)   return false
        if (filters.type       && t.type       !== filters.type)       return false
        if (filters.assigneeId && t.assigneeId !== filters.assigneeId) return false
        if (filters.category   && t.category   !== filters.category)   return false
        return true
      })
      .sort((a, b) => {
        const pa = PRIORITY_ORDER[a.priority] ?? 99
        const pb = PRIORITY_ORDER[b.priority] ?? 99
        if (pa !== pb) return pa - pb
        return (a.order ?? 0) - (b.order ?? 0)
      })
  }

  function handleFilterChange(key, value) {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  function handleClearAll() {
    setFilters(EMPTY_FILTERS)
  }

  async function onDragEnd(result) {
    const { destination, source, draggableId } = result
    if (!destination) return
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) return

    // Optimistic update
    setTasks(prev =>
      prev.map(t =>
        t.id === draggableId ? { ...t, status: destination.droppableId } : t
      )
    )

    await updateTask(draggableId, { status: destination.droppableId })
  }

  async function handleDeleteTask() {
    if (!editingTask) return
    await deleteTask(editingTask.id)
    setEditingTask(null)
  }

  // Keep modal in sync with live task data
  useEffect(() => {
    if (!editingTask) return
    const updated = tasks.find(t => t.id === editingTask.id)
    if (updated) setEditingTask(updated) // eslint-disable-line react-hooks/set-state-in-effect
  }, [tasks]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearAll={handleClearAll}
        users={users}
        categories={categories}
      />
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
          onDelete={handleDeleteTask}
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
}
