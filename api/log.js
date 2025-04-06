import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    return res.status(200).end()
  }

  res.setHeader('Access-Control-Allow-Origin', '*') // Allow CORS

  if (req.method !== 'POST') return res.status(405).end()

  const { speaker, message, emotional_tone, tags } = req.body

  if (!speaker || !message) {
    return res.status(400).json({ error: 'Missing speaker or message.' })
  }

  try {
    const { error } = await supabase.from('conversations').insert([
      {
        speaker,
        message,
        emotional_tone: emotional_tone || 'neutral',
        tags: tags || []
      }
    ])

    if (error) {
      console.error('Supabase insert error:', error)
      return res.status(500).json({ error: 'Failed to log message.' })
    }

    return res.status(200).json({ status: 'Message logged successfully.' })

  } catch (err) {
    console.error('Unexpected error:', err)
    return res.status(500).json({ error: 'Unexpected error occurred.' })
  }
}
