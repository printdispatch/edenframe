
let autoSpeak = false;

document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('auto-toggle');
    if (toggle) {
        toggle.addEventListener('change', () => {
            autoSpeak = toggle.checked;
        });
    }

    const form = document.getElementById('prompt-form');
    const input = document.getElementById('prompt-input');
    const output = document.getElementById('response');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userInput = input.value.trim();
        if (!userInput) return;

        output.innerHTML = 'Thinking...';

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: userInput }),
            });

            const data = await response.json();
            output.innerHTML = data.reply;

            createVoiceButton(data.reply);
            if (autoSpeak) speak(data.reply);
        } catch (err) {
            output.innerHTML = 'Something went wrong.';
            console.error(err);
        }
    });
});

function createVoiceButton(text) {
    const buttonContainer = document.getElementById('voice-button-container');
    buttonContainer.innerHTML = '';
    const button = document.createElement('button');
    button.textContent = '▶️ Play Voice';
    button.addEventListener('click', () => speak(text));
    buttonContainer.appendChild(button);
}

async function speak(text) {
    try {
        const response = await fetch('/api/speak', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text }),
        });
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.play();
    } catch (err) {
        console.error('Voice error:', err);
    }
}
