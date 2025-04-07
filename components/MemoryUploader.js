
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
    <div className="flex items-center gap-4 mb-4">
  <label className="text-sm font-medium">Speaker:</label>
  <button
    type="button"
    onClick={() => setSpeaker(speaker === 'Lyra' ? 'Dreamer' : 'Lyra')}
    className={`px-3 py-1 rounded border ${
      speaker === 'Lyra' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-black'
    }`}
  >
    {speaker}
  </button>
</div>


      <textarea className="p-2 border rounded w-full" placeholder="Message" value={message} onChange={(e) => setMessage(e.target.value)} /><br />
      <input className="p-2 border rounded w-full" placeholder="Tone" value={tone} onChange={(e) => setTone(e.target.value)} /><br />
      <input className="p-2 border rounded w-full" placeholder="Tags" value={tags} onChange={(e) => setTags(e.target.value)} /><br />
     <button
        onClick={handleSubmit}
        className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
>
  Upload
</button>

      <p className="mt-2 text-sm text-green-600">{status}</p>

    </div>
  )
}
