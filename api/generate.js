import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { prompt } = req.body
  const openaiKey = process.env.OPENAI_API_KEY

  try {
    const { data: personaData } = await supabase
      .from('persona')
      .select('description')
      .eq('name', 'Lyra')
      .single()

    const persona = personaData?.description || "You are Lyra."

    const { data: symbolData } = await supabase
      .from('symbols')
      .select('symbol_name, meaning')

    const { data: memories } = await supabase
      .from('conversations')
      .select('message, emotional_tone')
      .eq('speaker', 'Lyra')
      .order('timestamp', { ascending: false })
      .limit(5)

    const memoryLines = memories?.length
      ? memories.map(m => `Lyra once said: "${m.message}" (tone: ${m.emotional_tone})`).join("\\n")
      : "Lyra has no memories yet."

    const symbolDefs = symbolData?.length
      ? symbolData.map(s => `${s.symbol_name}: ${s.meaning}`).join("\\n")
      : ""

    const systemPrompt = {
      role: 'system',
      content: `${persona}\\n\\n${memoryLines}\\n\\nSymbolic anchors:\\n${symbolDefs}`
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
    const reply = data.choices?.[0]?.message?.content

    if (!reply) {
      return res.status(500).json({ reply: data.error?.message || 'No valid response from OpenAI.' })
    }

    res.status(200).json({ reply })

  } catch (err) {
    console.error("Error in generate:", err)
    res.status(500).json({ reply: `Error: ${err.message}` })
  }
}
