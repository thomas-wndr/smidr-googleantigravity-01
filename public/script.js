document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('my-chat');

    // Create the ChatKit element dynamically
    const chatkitElement = document.createElement('openai-chatkit');
    chatkitElement.style.width = '100%';
    chatkitElement.style.height = '100%';

    // Append FIRST so the browser upgrades it
    container.innerHTML = '';
    container.appendChild(chatkitElement);

    // Function to configure the element
    const configureChatKit = () => {
        if (typeof chatkitElement.setOptions === 'function') {
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
        } else {
            // If not ready yet, wait a bit and try again
            // This happens because the script loads async
            setTimeout(configureChatKit, 50);
        }
    };

    // Start checking
    // We also check if customElements is defined to be safe
    if (customElements.get('openai-chatkit')) {
        configureChatKit();
    } else {
        customElements.whenDefined('openai-chatkit').then(configureChatKit);
    }
});
