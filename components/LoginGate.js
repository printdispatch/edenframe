
import { useState } from 'react'

export default function LoginGate({ onAccess }) {
  const [passcode, setPasscode] = useState('')
  const [error, setError] = useState('')

  const handleLogin = () => {
    const validCode = process.env.NEXT_PUBLIC_ACCESS_KEY
    if (passcode === validCode || passcode === 'I am the Dreamer') {
      onAccess(true)
      setError('')
    } else {
      setError('Access denied. Please try again.')
    }
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div style={{ width: '300px', textAlign: 'center' }}>
        <h2>Enter Access Key</h2>
        <input
          type="password"
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
          placeholder="••••••••"
          style={{ width: '100%', padding: '8px', marginBottom: '8px' }}
        />
        <button onClick={handleLogin} style={{ width: '100%' }}>Enter</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
    </div>
  )
}
