import { useState, useEffect } from 'react'
import Board from './components/Board'
import { getUsers } from './firebase/users'

export default function App() {
  const [users, setUsers]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [showCreate, setShowCreate] = useState(false)

  useEffect(() => {
    getUsers().then(data => {
      setUsers(data)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-400 text-lg animate-pulse">טוען לוח...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <h1 className="text-xl font-bold text-gray-800 tracking-tight">
          לוח משימות — Book-A-Trip
        </h1>
          <button
            onClick={() => setShowCreate(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            + משימה חדשה
          </button>
      </header>

      {/* Board */}
      <main className="p-6">
        <Board users={users} showCreate={showCreate} setShowCreate={setShowCreate} />
      </main>
    </div>
  )
}
