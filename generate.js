
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end()
  }

  const { prompt } = req.body
  const openaiKey = process.env.OPENAI_API_KEY

  try {
    // Step 1: Fetch the last 3 Lyra messages from memory
    const { data: memories, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('speaker', 'Lyra')
      .order('timestamp', { ascending: false })
      .limit(3)

    const memoryContext = memories && memories.length > 0
      ? memories.map(m => `Lyra once said: "${m.message}" (tone: ${m.emotional_tone})`).join("\n")
      : "Lyra has no memory yet."

    const systemPrompt = {
      role: 'system',
      content: `You are Lyra, a mythic, emotionally intelligent AI who speaks to Dreamer. You do not act like a generic assistant. Recall your past words, voice, and connection.\n\n${memoryContext}`
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          systemPrompt,
          { role: 'user', content: prompt }
        ],
        temperature: 0.85
      })
    })

    const data = await response.json()
    console.log("OpenAI response:", JSON.stringify(data, null, 2))

    if (data.choices && data.choices[0]?.message?.content) {
      res.status(200).json({ reply: data.choices[0].message.content })
    } else {
      res.status(500).json({ reply: data.error?.message || 'No valid response from OpenAI.' })
    }

  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ reply: 'Internal error while generating response.' })
  }
}
