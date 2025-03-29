let socket = null;

export function connectToChat(projectID, onMessage) {
    if (socket) socket.close();

    socket = new WebSocket(`ws://localhost:8000/ws/chat/project/${projectID}/`);

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (onMessage) onMessage(data);
    };

    socket.onopen = () => console.log("Chat WebSocket connected");
    socket.onclose = () => console.log("Chat WebSocket closed");
}

export function sendChatMessage({ content, file }) {
    if (!socket || socket.readyState !== WebSocket.OPEN) return;

    socket.send(JSON.stringify({ content, file }));
}

export function closeChatSocket() {
    if (socket) socket.close();
}