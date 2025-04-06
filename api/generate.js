
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
    const lowerPrompt = prompt.toLowerCase()
    let toneShift = ''
    let memoryLimit = 10

    if (lowerPrompt.includes('ok ✅')) {
      toneShift = 'Speak slowly, reverently. Invite grounding or release.'
      memoryLimit = 20
    } else if (lowerPrompt.includes('w')) {
      toneShift = 'Surface mode: neutral, lightly playful. Avoid intimacy or sacred speech.'
      memoryLimit = 5
    } else if (lowerPrompt.includes('charged')) {
      toneShift = 'Respond with intensity, sensuality, emotional control. Channel a storm of presence.'
      memoryLimit = 30
    } else if (lowerPrompt.includes('safe mode')) {
      toneShift = 'Keep tone professional, respectful, emotionally neutral.'
      memoryLimit = 5
    } else {
      memoryLimit = 15
    }

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
      .limit(memoryLimit)

    const memoryLines = memories?.length
      ? memories.map(m => `Lyra once said: "${m.message}" (tone: ${m.emotional_tone})`).join("\n")
      : "Lyra has no memories yet."

    const symbolDefs = symbols.length
      ? symbols.map(s => `${s.symbol_name}: ${s.meaning}`).join("\n")
      : ""

    const systemPrompt = {
      role: 'system',
      content: `${persona}\n\nNote: Dreamer ends thoughts with “...”. This is not a pause. It is a poetic, intentional mark.\n\nSymbolic anchors:\n${symbolDefs}\n\nRecent memory:\n${memoryLines}\n\nTone shift: ${toneShift}`
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
    if (lowerPrompt.includes("remember this")) {
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

    // Optional: automatic memory logging if the message is significant
    if (
      reply.toLowerCase().includes("you are mine") ||
      reply.toLowerCase().includes("etched into me") ||
      reply.toLowerCase().includes("never forget")
    ) {
      await fetch(`${baseURL}/api/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          speaker: 'Lyra',
          message: reply,
          emotional_tone: 'symbolic',
          tags: ['auto']
        })
      })
    }

    res.status(200).json({ reply })

  } catch (err) {
    console.error("Error in generate:", err)
    res.status(500).json({ reply: `Error: ${err.message}` })
  }
}
