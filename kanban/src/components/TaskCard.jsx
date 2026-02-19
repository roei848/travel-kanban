import { Draggable } from '@hello-pangea/dnd'
import Avatar from './Avatar'

const PRIORITY_STYLES = {
  critical: { bg: 'bg-red-100 text-red-700',       label: 'קריטי' },
  high:     { bg: 'bg-orange-100 text-orange-700', label: 'גבוה' },
  medium:   { bg: 'bg-yellow-100 text-yellow-700', label: 'בינוני' },
  low:      { bg: 'bg-green-100 text-green-700',   label: 'נמוך' },
}

const TYPE_STYLES = {
  BE:   { bg: 'bg-blue-100 text-blue-700',     label: 'BE' },
  FE:   { bg: 'bg-purple-100 text-purple-700', label: 'FE' },
  BOTH: { bg: 'bg-teal-100 text-teal-700',     label: 'BE+FE' },
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
            hover:shadow-md transition-all relative
            ${snapshot.isDragging ? 'shadow-lg rotate-1 scale-105 border-blue-200' : ''}`}
        >
          {/* Edit icon — top left (visually left in RTL = start of line) */}
          <button
            onClick={e => { e.stopPropagation(); onEdit(task) }}
            className="absolute top-2 left-2 text-gray-300 hover:text-gray-500 text-xs p-1 leading-none"
            aria-label="ערוך משימה"
          >
            ✏️
          </button>

          {/* Type + Priority badges */}
          <div className="flex items-center gap-1.5 mb-2 flex-wrap pr-1">
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${type.bg}`}>
              {type.label}
            </span>
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${priority.bg}`}>
              {priority.label}
            </span>
          </div>

          {/* Title */}
          <p className="text-sm font-medium text-gray-800 leading-snug mb-2 pl-6">
            {task.title}
          </p>

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
