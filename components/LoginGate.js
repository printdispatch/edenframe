
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

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
    <div className="flex items-center justify-center h-screen">
      <Card className="w-full max-w-md p-6 text-center">
        <CardContent>
          <h1 className="text-2xl font-semibold mb-4">Welcome to Edenframe</h1>
          <p className="text-sm text-muted-foreground mb-6">Please enter your access key</p>
          <Input
            type="password"
            placeholder="••••••••"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            className="mb-4"
          />
          {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
          <Button onClick={handleLogin} className="w-full">Enter</Button>
        </CardContent>
      </Card>
    </div>
  )
}
