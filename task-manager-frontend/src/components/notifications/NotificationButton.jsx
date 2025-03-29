import { useEffect, useState, useRef } from "react";
import { useNotifications } from "../../context/NotificationContext";
import { connectToNotificationSocket, closeNotificationSocket } from "../../utils/notifications";
import { markNotificationAsRead, markAllNotificationsRead, fetchNotifications } from "../../api/notifications";

export default function NotificationButton() {
    const { notifications, setNotifications } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const buttonRef = useRef();

    const toggleDropdown = () => setIsOpen(!isOpen);

    const typeLabels = {
        INVITE: "Project Invite",
        CHAT: "New Chat Message",
        DEADLINE: "Deadline Reminder",
    };

    const handleNotificationClick = async (index, notification) => {
        if (!notification.is_read && notification.id) {
        try {
            await markNotificationAsRead(notification.id);
            setNotifications((prev) => prev.filter((_, i) => i !== index)); // Remove it
        } catch (err) {
            console.error("Failed to mark notification as read", err);
        }
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await markAllNotificationsRead();
            setNotifications([]);
        } catch (err) {
            console.error("Failed to mark all as read", err);
        }
    };

    const unreadCount = notifications.length;

    return (
        <div className="relative" ref={buttonRef}>
            <button
                onClick={toggleDropdown}
                className="relative bg-[#67ad95] text-white px-3 py-1 rounded"
            >
                Notifications
                {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1">
                    {unreadCount}
                </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border rounded shadow-lg z-50 max-h-96 overflow-y-auto">
                    <div className="flex justify-between items-center px-3 py-2 border-b">
                        <span className="text-sm font-medium text-gray-700">
                            Unread Notifications
                        </span>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="text-blue-600 text-sm hover:underline"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>
                    <ul className="divide-y divide-gray-200">
                        {unreadCount === 0 ? (
                            <li className="p-4 text-gray-500 text-sm text-center">
                                No new notifications
                            </li>
                        ) : (
                            notifications.map((notif, idx) => (
                                <li
                                    key={idx}
                                    onClick={() => handleNotificationClick(idx, notif)}
                                    className={`p-3 cursor-pointer hover:bg-gray-100 text-sm ${
                                        !notif.is_read ? "bg-blue-50 font-medium" : ""
                                    }`}
                                >
                                    <div className="text-sm font-semibold text-blue-600">
                                        {typeLabels[notif.notification_type]}
                                    </div>
                                    <div className="text-sm text-black">{notif.message}</div>
                                    <div className="text-xs text-gray-400">
                                        {new Date(notif.created_at).toLocaleString()}
                                    </div>
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}