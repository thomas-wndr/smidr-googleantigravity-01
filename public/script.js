document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('chat-form');
    const input = document.getElementById('user-input');
    const history = document.getElementById('chat-history');
    const submitBtn = form.querySelector('button');

    let messages = [];

    function appendMessage(role, text) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${role}`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'content';
        contentDiv.textContent = text;
        
        msgDiv.appendChild(contentDiv);
        history.appendChild(msgDiv);
        history.scrollTop = history.scrollHeight;

        messages.push({ role, content: text });
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (!text) return;

        // Add user message
        appendMessage('user', text);
        input.value = '';
        submitBtn.disabled = true;

        try {
            const response = await fetch('chat.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ messages })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }

            const botMessage = data.choices[0].message.content;
            appendMessage('assistant', botMessage);

        } catch (error) {
            console.error('Error:', error);
            appendMessage('bot', 'Sorry, something went wrong. Please check your API key and connection.');
        } finally {
            submitBtn.disabled = false;
            input.focus();
        }
    });
});
