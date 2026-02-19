import { Droppable } from '@hello-pangea/dnd'
import TaskCard from './TaskCard'

const COLUMN_COLORS = {
  backlog:       'border-gray-300',
  todo:          'border-blue-300',
  'in-progress': 'border-yellow-400',
  done:          'border-green-400',
}

const COLUMN_HEADER_COLORS = {
  backlog:       'text-gray-600',
  todo:          'text-blue-600',
  'in-progress': 'text-yellow-600',
  done:          'text-green-600',
}

export default function Column({ column, tasks, users, onEdit }) {
  return (
    <div
      className={`flex flex-col bg-gray-50 rounded-2xl border-2 ${COLUMN_COLORS[column.id]}
        flex-1 min-w-[220px] max-h-[calc(100vh-172px)]`}
    >
      {/* Column header */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <h2 className={`font-bold text-base ${COLUMN_HEADER_COLORS[column.id]}`}>
          {column.label}
        </h2>
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
            className={`flex-1 overflow-y-auto px-3 pb-3 flex flex-col gap-2 min-h-[80px] transition-colors
              ${snapshot.isDraggingOver ? 'bg-blue-50 rounded-b-2xl' : ''}`}
          >
            {tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                users={users}
                onEdit={onEdit}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  )
}
