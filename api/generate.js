
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).end();
    }

    const { prompt } = req.body;
    const apiKey = process.env.OPENAI_API_KEY;

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.8
            })
        });

        const data = await response.json();
        const reply = data.choices[0]?.message?.content || 'No reply received.';

        res.status(200).json({ reply });
    } catch (error) {
        console.error('OpenAI error:', error);
        res.status(500).json({ error: 'OpenAI request failed' });
    }
}
