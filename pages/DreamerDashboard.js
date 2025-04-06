
import { useState } from 'react'
import LoginGate from '../components/LoginGate'
import MemoryUploader from '../components/MemoryUploader'

export default function DreamerDashboard() {
  const [authorized, setAuthorized] = useState(false)

  if (!authorized) {
    return <LoginGate onAccess={setAuthorized} />
  }

  return (
    <div className="min-h-screen p-4 bg-muted">
      <h1 className="text-3xl font-bold mb-6 text-center">Dreamer Dashboard</h1>
      <MemoryUploader />
    </div>
  )
}
