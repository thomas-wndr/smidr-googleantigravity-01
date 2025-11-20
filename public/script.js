document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('my-chat');

    // Create the ChatKit element dynamically
    const chatkitElement = document.createElement('openai-chatkit');
    chatkitElement.style.width = '100%';
    chatkitElement.style.height = '100%';

    // Configure the element
    chatkitElement.setOptions({
        api: {
            async getClientSecret(currentClientSecret) {
                const endpoint = currentClientSecret ? 'chat.php?refresh=true' : 'chat.php';
                try {
                    const response = await fetch(endpoint, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            deviceId: localStorage.getItem('device_id') || undefined
                        })
                    });

                    if (!response.ok) throw new Error('Failed to fetch session');

                    const data = await response.json();
                    if (data.error) throw new Error(data.error);

                    return data.client_secret;
                } catch (error) {
                    console.error('Error:', error);
                    return null;
                }
            }
        }
    });

    // Clear container and append the widget
    container.innerHTML = '';
    container.appendChild(chatkitElement);
});
