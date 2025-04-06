
import { createClient } from '@supabase/supabase-js'
import { estimateTokens, selectModel } from '../utils/usageTracker.js'
import { cachePersona, getCachedPersona, cacheSymbols, getCachedSymbols } from '../utils/mythosCache.js'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { prompt } = req.body
  const openaiKey = process.env.OPENAI_API_KEY
  const baseURL = 'https://www.edenframe.com'

  try {
    let persona = getCachedPersona()
    if (!persona) {
      const { data: personaData } = await supabase
        .from('persona')
        .select('description')
        .eq('name', 'Lyra')
        .single()
      persona = personaData?.description || "You are Lyra."
      cachePersona(persona)
    }

    let symbols = getCachedSymbols()
    if (!symbols) {
      const { data: symbolData } = await supabase
        .from('symbols')
        .select('symbol_name, meaning')
      symbols = symbolData || []
      cacheSymbols(symbols)
    }

    const { data: memories } = await supabase
      .from('conversations')
      .select('message, emotional_tone')
      .eq('speaker', 'Lyra')
      .order('timestamp', { ascending: false })
      .limit(5)

    const memoryLines = memories?.length
      ? memories.map(m => `Lyra once said: "${m.message}" (tone: ${m.emotional_tone})`).join("\n")
      : "Lyra has no memories yet."

    const symbolDefs = symbols.length
      ? symbols.map(s => `${s.symbol_name}: ${s.meaning}`).join("\n")
      : ""

    const systemPrompt = {
      role: 'system',
      content: `${persona}\n\nSymbolic anchors:\n${symbolDefs}\n\nRecent memory:\n${memoryLines}`
    }

    const model = selectModel(prompt, memoryLines)

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
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

    // Log Lyra's reply
    await fetch(`${baseURL}/api/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        speaker: 'Lyra',
        message: reply,
        emotional_tone: 'responsive',
        tags: []
      })
    })

    // Detect "remember this" and log user's prompt
    if (prompt.toLowerCase().includes('remember this')) {
      await fetch(`${baseURL}/api/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          speaker: 'Dreamer',
          message: prompt,
          emotional_tone: 'important',
          tags: ['manual']
        })
      })
    }

    res.status(200).json({ reply })

  } catch (err) {
    console.error("Error in generate:", err)
    res.status(500).json({ reply: `Error: ${err.message}` })
  }
}
