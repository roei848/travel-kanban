export const PRIORITIES = [
  { value: 'critical', label: 'קריטי' },
  { value: 'high',     label: 'גבוה' },
  { value: 'medium',   label: 'בינוני' },
  { value: 'low',      label: 'נמוך' },
]

export const TYPES = [
  { value: 'FE',   label: 'FE' },
  { value: 'BE',   label: 'BE' },
  { value: 'BOTH', label: 'BE+FE' },
]

export const TYPE_LABELS = { BE: 'BE', FE: 'FE', BOTH: 'BE+FE' }

export const PRIORITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 }
