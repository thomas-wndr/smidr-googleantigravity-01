document.addEventListener('DOMContentLoaded', () => {
    const chatkitContainer = document.getElementById('my-chat');

    // Wait for ChatKit to be available if it loads async
    const initChatKit = () => {
        if (chatkitContainer && chatkitContainer.setOptions) {
            chatkitContainer.setOptions({
                api: {
                    async getClientSecret(currentClientSecret) {
                        // If we have a valid secret, we might want to reuse it or refresh it
                        // For simplicity, we'll fetch a new one or refresh if needed

                        const endpoint = currentClientSecret ? 'chat.php?refresh=true' : 'chat.php';

                        try {
                            const response = await fetch(endpoint, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    deviceId: localStorage.getItem('device_id') || undefined
                                })
                            });

                            if (!response.ok) {
                                throw new Error('Failed to fetch session token');
                            }

                            const data = await response.json();

                            if (data.error) {
                                console.error('Session Error:', data.error);
                                return null;
                            }

                            return data.client_secret;
                        } catch (error) {
                            console.error('Error fetching client secret:', error);
                            return null;
                        }
                    }
                }
            });
        } else {
            // Retry if script hasn't loaded yet
            setTimeout(initChatKit, 100);
        }
    };

    initChatKit();
});
