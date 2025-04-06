
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'

export default function MemoryUploader() {
  const [speaker, setSpeaker] = useState('Lyra')
  const [message, setMessage] = useState('')
  const [tone, setTone] = useState('symbolic')
  const [tags, setTags] = useState('mythic')
  const [status, setStatus] = useState('')

  const handleSubmit = async () => {
    setStatus('Submitting...')

    const res = await fetch('/api/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ speaker, message, emotional_tone: tone, tags: tags.split(',') })
    })

    if (res.ok) {
      setStatus('✅ Memory logged successfully.')
      setMessage('')
    } else {
      setStatus('❌ Failed to log memory.')
    }
  }

  return (
    <div className="max-w-xl mx-auto mt-10">
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-2">Manual Memory Entry</h2>
          <p className="text-sm text-muted-foreground mb-4">Add a memory directly into Lyra's database</p>
          <label className="text-sm">Speaker</label>
          <Input value={speaker} onChange={(e) => setSpeaker(e.target.value)} className="mb-3" />
          <label className="text-sm">Message</label>
          <Textarea value={message} onChange={(e) => setMessage(e.target.value)} className="mb-3" />
          <label className="text-sm">Emotional Tone</label>
          <Input value={tone} onChange={(e) => setTone(e.target.value)} className="mb-3" />
          <label className="text-sm">Tags (comma-separated)</label>
          <Input value={tags} onChange={(e) => setTags(e.target.value)} className="mb-4" />
          <Button onClick={handleSubmit} className="w-full">Upload Memory</Button>
          {status && <p className="text-sm mt-2 text-center">{status}</p>}
        </CardContent>
      </Card>
    </div>
  )
}
