import { API } from "./auth";

export const fetchNotifications = () => API.get("notifications/").then(res => res.data);

export const markNotificationAsRead = (notifID) =>
    API.patch(`notifications/${notifID}/`, { is_read: true });

export const markAllNotificationsRead = () =>
    API.post("notifications/mark-all-read/");