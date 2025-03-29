let notifSocket = null;

export const connectToNotificationSocket = (onMessage) => {
    const token = localStorage.getItem("access");
    if (!token) {
        console.warn("No access token found for WebSocket auth.");
        return;
    }
    if (notifSocket && notifSocket.readyState !== WebSocket.CLOSED) {
        console.log("Notification WebSocket already open");
        return;
    }

    notifSocket = new WebSocket(`ws://localhost:8000/ws/notifications/?token=${token}`);

    notifSocket.onopen = () => {
        console.log("Notifications WebSocket connected");
    };

    notifSocket.onmessage = (e) => {
        const data = JSON.parse(e.data);
        onMessage(data);
    };

    notifSocket.onclose = () => {
        console.log("Notifications WebSocket disconnected");
    };
};

export const closeNotificationSocket = () => {
    if (notifSocket) {
        notifSocket.close();
        notifSocket = null;
    }
};