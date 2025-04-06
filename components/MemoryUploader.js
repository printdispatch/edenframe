
import { useState } from 'react'

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
    <div style={{ maxWidth: '600px', margin: '50px auto' }}>
      <h2>Manual Memory Entry</h2>
      <input placeholder="Speaker" value={speaker} onChange={(e) => setSpeaker(e.target.value)} /><br />
      <textarea placeholder="Message" value={message} onChange={(e) => setMessage(e.target.value)} /><br />
      <input placeholder="Tone" value={tone} onChange={(e) => setTone(e.target.value)} /><br />
      <input placeholder="Tags" value={tags} onChange={(e) => setTags(e.target.value)} /><br />
      <button onClick={handleSubmit}>Upload</button>
      <p>{status}</p>
    </div>
  )
}
