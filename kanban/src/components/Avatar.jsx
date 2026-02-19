export default function Avatar({ user, size = 'sm' }) {
  const sizes = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base',
  }

  const cls = `${sizes[size]} rounded-full flex items-center justify-center font-bold text-white overflow-hidden flex-shrink-0`

  if (user?.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt={user.name}
        className={`${sizes[size]} rounded-full object-cover flex-shrink-0`}
      />
    )
  }

  return (
    <div className={cls} style={{ backgroundColor: user?.avatarColor || '#94a3b8' }}>
      {user?.name?.[0] || '?'}
    </div>
  )
}
