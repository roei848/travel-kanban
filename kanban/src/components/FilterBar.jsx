import { useState, useRef, useEffect } from 'react'
import { PRIORITIES, TYPES } from '../constants/taskFields'
import Avatar from './Avatar'

const PRIORITY_STYLES = {
  critical: 'bg-red-100 text-red-700',
  high:     'bg-orange-100 text-orange-700',
  medium:   'bg-yellow-100 text-yellow-700',
  low:      'bg-green-100 text-green-700',
}

const TYPE_STYLES = {
  BE:   'bg-blue-100 text-blue-700',
  FE:   'bg-purple-100 text-purple-700',
  BOTH: 'bg-teal-100 text-teal-700',
}

function FilterDropdown({ label, value, onChange, options, placeholder, renderOption, renderSelected }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selected = options.find(o => o.value === value)
  const isActive = !!value

  return (
    <div className="flex flex-col gap-1 relative" ref={ref}>
      <label className="text-xs text-gray-500 font-medium">{label}</label>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-2 text-sm rounded-xl px-3 py-1.5 min-w-[110px] justify-between transition-all
          ${isActive
            ? 'bg-blue-50 border-2 border-blue-300 text-blue-700 font-medium'
            : open
              ? 'bg-white border-2 border-blue-300 text-gray-600'
              : 'bg-white border border-gray-200 hover:border-gray-300 text-gray-600'
          }`}
      >
        <span className="flex items-center gap-2">
          {selected
            ? (renderSelected ? renderSelected(selected) : <span>{selected.label}</span>)
            : <span className="text-gray-400">{placeholder}</span>
          }
        </span>
        <svg
          className={`w-3.5 h-3.5 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''} ${isActive ? 'text-blue-400' : 'text-gray-400'}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full mt-1.5 right-0 bg-white border border-gray-200 rounded-xl shadow-xl z-50 w-max min-w-full overflow-hidden py-1">
          <div
            onClick={() => { onChange(''); setOpen(false) }}
            className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 transition-colors
              ${!value ? 'text-blue-600 font-medium bg-blue-50' : 'text-gray-400'}`}
          >
            {placeholder}
          </div>
          {options.map(opt => (
            <div
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false) }}
              className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 flex items-center gap-2 transition-colors
                ${value === opt.value ? 'bg-blue-50' : ''}`}
            >
              {renderOption
                ? renderOption(opt, value === opt.value)
                : <span className={value === opt.value ? 'text-blue-700 font-medium' : 'text-gray-700'}>{opt.label}</span>
              }
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function FilterBar({ filters, onFilterChange, onClearAll, users, categories }) {
  const hasActiveFilter = Object.values(filters).some(v => v !== '')

  const priorityOptions = PRIORITIES.map(p => ({ value: p.value, label: p.label }))
  const typeOptions     = TYPES.map(t => ({ value: t.value, label: t.label }))
  const userOptions     = users.map(u => ({ value: u.id, label: u.name, user: u }))
  const categoryOptions = categories.map(c => ({ value: c, label: c }))

  return (
    <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-end gap-3 flex-wrap shadow-sm">

      {/* עדיפות */}
      <FilterDropdown
        label="עדיפות"
        value={filters.priority}
        onChange={v => onFilterChange('priority', v)}
        options={priorityOptions}
        placeholder="הכל"
        renderOption={(opt, isSelected) => (
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${PRIORITY_STYLES[opt.value]} ${isSelected ? 'ring-2 ring-offset-1 ring-blue-200' : ''}`}>
            {opt.label}
          </span>
        )}
        renderSelected={opt => (
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${PRIORITY_STYLES[opt.value]}`}>
            {opt.label}
          </span>
        )}
      />

      {/* סוג */}
      <FilterDropdown
        label="סוג"
        value={filters.type}
        onChange={v => onFilterChange('type', v)}
        options={typeOptions}
        placeholder="הכל"
        renderOption={(opt, isSelected) => (
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${TYPE_STYLES[opt.value]} ${isSelected ? 'ring-2 ring-offset-1 ring-blue-200' : ''}`}>
            {opt.label}
          </span>
        )}
        renderSelected={opt => (
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${TYPE_STYLES[opt.value]}`}>
            {opt.label}
          </span>
        )}
      />

      {/* נציג */}
      <FilterDropdown
        label="נציג"
        value={filters.assigneeId}
        onChange={v => onFilterChange('assigneeId', v)}
        options={userOptions}
        placeholder="כולם"
        renderOption={opt => (
          <>
            <Avatar user={opt.user} size="sm" />
            <span className="text-gray-700">{opt.label}</span>
          </>
        )}
        renderSelected={opt => (
          <>
            <Avatar user={opt.user} size="sm" />
            <span>{opt.label}</span>
          </>
        )}
      />

      {/* קטגוריה */}
      <FilterDropdown
        label="קטגוריה"
        value={filters.category}
        onChange={v => onFilterChange('category', v)}
        options={categoryOptions}
        placeholder="הכל"
      />

      {/* נקה הכל */}
      {hasActiveFilter && (
        <button
          type="button"
          onClick={onClearAll}
          className="mt-auto flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 font-medium px-3 py-1.5 rounded-xl hover:bg-red-50 transition-colors border border-transparent hover:border-red-100"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          נקה הכל
        </button>
      )}
    </div>
  )
}
