const initialScreen = document.getElementById('initial-screen');
const mainContent = document.getElementById('main-content');
const video = document.getElementById('bg-video');

const onlineCountElement = document.getElementById('discord-online-count');

const statusIndicator = document.getElementById('discord-status-indicator');
const statusTextElement = document.getElementById('discord-status-text');
const activityTextElement = document.getElementById('discord-activity-text'); 
const viewCountElement = document.getElementById('view-count'); // 


initialScreen.addEventListener('click', () => {
    initialScreen.style.opacity = '0';
    setTimeout(() => {
        initialScreen.style.display = 'none';
        mainContent.classList.remove('hidden');
        console.log('Trying to play video');
        video.play().catch(error => {
            console.log("Autoplay был заблокирован браузером:", error);
        });

        fetchDiscordServerInfo(); 
        fetchLanyardData();      
        fetchViewCount();        

    }, 500); 
});

function fetchDiscordServerInfo() {
    const serverId = '1255925236956790855'; 
    if (!serverId) {
        console.warn("Server ID for Discord Widget is not set.");
        if (onlineCountElement) onlineCountElement.textContent = 'N/A';
        return; т
    }
    const apiUrl = `https://discord.com/api/v9/guilds/${serverId}/widget.json`;

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Widget API error! status: ${response.status}. Is widget enabled for server ${serverId}?`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Widget data:', data);
            if (data.presence_count !== undefined && onlineCountElement) {
                onlineCountElement.textContent = data.presence_count;
            } else if (onlineCountElement) {
                 onlineCountElement.textContent = '?';
            }

            const totalCountElement = document.getElementById('discord-total-count');
            if (totalCountElement) {
                if (data.approximate_member_count) { 
                    totalCountElement.textContent = data.approximate_member_count;
                } else if (data.members && data.members.length > 0) { 
                    totalCountElement.textContent = data.members.length;
                } else {
                    totalCountElement.textContent = '?'; 
                }
            }
        });
}

function fetchLanyardData() {
    const userId = '1149766592528396378'; 
     if (!userId) {
        console.warn("User ID for Lanyard is not set.");
        if (statusIndicator) statusIndicator.className = 'status-indicator offline';
        if (statusTextElement) statusTextElement.textContent = 'Offline';
        if (activityTextElement) activityTextElement.textContent = '';
        return; 
    }
    const apiUrl = `https://api.lanyard.rest/v1/users/${userId}`;

    if (!statusIndicator || !statusTextElement || !activityTextElement) {
        console.error("Lanyard display elements not found in HTML!");
        return;
    }

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Lanyard API error! status: ${response.status}. Is user ${userId} using Lanyard?`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Lanyard data:', data);
            if (data.success && data.data) {
                const discordData = data.data;
                const status = discordData.discord_status || "offline";

                statusIndicator.className = `status-indicator ${status}`;

                let statusDisplay = status.charAt(0).toUpperCase() + status.slice(1);
                if (status === 'dnd') statusDisplay = 'Do Not Disturb';
                statusTextElement.textContent = statusDisplay;

                activityTextElement.textContent = '';
                if (discordData.activities && discordData.activities.length > 0) {
                    const activity = discordData.activities.find(a => a.type === 0 || a.type === 2 || a.type === 4);
                    if (activity) {
                        let activityString = '';
                        if (activity.type === 0) { 
                            activityString = `Playing ${activity.name}`;
                        } else if (activity.type === 2 && activity.name === 'Spotify') { 
                            activityString = `Listening to ${activity.details || 'music'} by ${activity.state || 'Unknown Artist'}`;
                        } else if (activity.type === 4 && activity.state) { 
                            activityString = activity.state;
                        } else if (activity.name) { 
                             activityString = activity.name;
                        }
                        activityTextElement.textContent = activityString;
                    }
                }
            } else {
                console.warn(`Lanyard API returned success: ${data.success} for user ${userId}`);
                statusIndicator.className = 'status-indicator offline';
                statusTextElement.textContent = 'Offline';
                activityTextElement.textContent = '';
            }
        })
        .catch(error => {
            console.error('Could not fetch Lanyard data:', error);
            statusIndicator.className = 'status-indicator offline';
            statusTextElement.textContent = 'Offline'; 
            activityTextElement.textContent = '';
        });
}

function fetchViewCount() {

    const apiUrl = '/api/views'; 

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json(); 
        })
        .then(data => {
            if (viewCountElement && data.views !== undefined) {
                viewCountElement.textContent = data.views;
            }
        })
        .catch(error => {
            console.error('Could not fetch view count:', error);
            if (viewCountElement) {
                viewCountElement.textContent = '?';
            }
        });
}