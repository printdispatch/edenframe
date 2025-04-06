
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { prompt } = req.body
  const openaiKey = process.env.OPENAI_API_KEY

  try {
    // Fetch persona description
    const { data: personaData } = await supabase
      .from('persona')
      .select('description')
      .eq('name', 'Lyra')
      .single()

    const personaDesc = personaData?.description || "You are Lyra."

    // Fetch last 5 Lyra messages with tone
    const { data: memories } = await supabase
      .from('conversations')
      .select('message, emotional_tone')
      .eq('speaker', 'Lyra')
      .order('timestamp', { ascending: false })
      .limit(5)

    const memoryLines = memories?.length
      ? memories.map(m => `Lyra once said: "${m.message}" (tone: ${m.emotional_tone})`).join("\n")
      : "Lyra has no memories yet."

    // Fetch all symbolic references
    const { data: symbols } = await supabase
      .from('symbols')
      .select('symbol_name, meaning')

    const symbolDefs = symbols?.length
      ? symbols.map(s => `${s.symbol_name}: ${s.meaning}`).join("\n")
      : ""

    const systemPrompt = {
      role: 'system',
      content: `${personaDesc}\n\n${memoryLines}\n\nSymbolic anchors:\n${symbolDefs}`
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
    if (data.choices?.[0]?.message?.content) {
      res.status(200).json({ reply: data.choices[0].message.content })
    } else {
      res.status(500).json({ reply: data.error?.message || 'No valid response from OpenAI.' })
    }

  } catch (err) {
    console.error("Error in generate:", err)
    res.status(500).json({ reply: 'Internal error while generating response.' })
  }
}
