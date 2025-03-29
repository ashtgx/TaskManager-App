import { useEffect, useState, createContext, useContext } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { connectToNotificationSocket, closeNotificationSocket } from "../utils/notifications";
import { fetchNotifications } from "../api/notifications";

export const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export function NotificationProvider({ children }) {
    const { user } = useAuth();
    const location = useLocation();
    const [notifications, setNotifications] = useState([]);
    const connectedRef = useState(false);

    useEffect(() => {
        const excludedRoutes = ["/", "/register"];
        const isAuthRoute = excludedRoutes.includes(location.pathname);

        if (user && !isAuthRoute && !connectedRef.current) {
            connectedRef.current = true;
            
            fetchNotifications().then((allNotification) => {
                const unread = allNotification.filter((notif) => !notif.is_read);
                setNotifications(unread);
            });

            connectToNotificationSocket((data) => {
                setNotifications((prev) => [data, ...prev]);
            });
        }

        return () => {
            if (connectedRef.current) {
                closeNotificationSocket();
                connectedRef.current = false;
              }
        }

    }, [user, location.pathname]);

    return (
        <NotificationContext.Provider value={{ notifications, setNotifications }}>
            {children}
        </NotificationContext.Provider>
    );
}