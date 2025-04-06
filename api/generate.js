
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
                model: 'gpt-4o',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.8
            })
        });

        const data = await response.json();
        console.log("OpenAI raw response:", JSON.stringify(data, null, 2));

        if (data.choices && data.choices.length > 0 && data.choices[0].message) {
            res.status(200).json({ reply: data.choices[0].message.content });
        } else if (data.error) {
            res.status(500).json({ reply: `OpenAI Error: ${data.error.message}` });
        } else {
            res.status(500).json({ reply: 'Error: No valid message returned from OpenAI.' });
        }

    } catch (error) {
        console.error('OpenAI API Error:', error);
        res.status(500).json({ reply: 'Request failed. Could not contact OpenAI.' });
    }
}
