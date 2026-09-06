/* ========================================== */
/* websocket.js: Persistent Data Streams      */
/* ========================================== */

const wsUrl = 'wss://ws.postman-echo.com/raw';
let liveSocket;

export function connectWebSocket() {
    console.log("🔌 Attempting to connect to live server...");
    
    liveSocket = new WebSocket(wsUrl);

    liveSocket.onopen = (event) => {
        console.log("🟢 Live Connection Established!");
        const statusIndicator = document.getElementById('connection-status');
        if (statusIndicator) statusIndicator.innerHTML = '🟢 Online';
    };

    liveSocket.onmessage = (event) => {
        console.log("📥 Incoming Stream:", event.data);
        
        const feedContainer = document.getElementById('live-feed');
        if (feedContainer) {
            const messageHTML = `<div class="msg received" style="color: blue; margin-bottom: 6px;">Server: ${event.data}</div>`;
            feedContainer.innerHTML += messageHTML;
            feedContainer.scrollTop = feedContainer.scrollHeight;
        }
    };

    liveSocket.onerror = (error) => {
        console.error("⚠️ WebSocket Error:", error);
    };

    liveSocket.onclose = (event) => {
        console.warn("🔴 Connection Lost.");
        const statusIndicator = document.getElementById('connection-status');
        if (statusIndicator) statusIndicator.innerHTML = '🔴 Offline';

        // Auto-reconnect option (Bonus Challenge)
        // setTimeout(connectWebSocket, 3000);
    };
}

export function sendLiveMessage(payloadText) {
    if (liveSocket && liveSocket.readyState === WebSocket.OPEN) {
        liveSocket.send(payloadText);
        console.log("📤 Outgoing Stream:", payloadText);
        
        const feedContainer = document.getElementById('live-feed');
        if (feedContainer) {
            const messageHTML = `<div class="msg sent" style="color: green; margin-bottom: 6px;">You: ${payloadText}</div>`;
            feedContainer.innerHTML += messageHTML;
            feedContainer.scrollTop = feedContainer.scrollHeight;
        }
    } else {
        console.error("Cannot transmit: Connection is not open.");
        alert("Wait for the connection to establish before sending.");
    }
}

// Automatically trigger connection on script load
connectWebSocket();