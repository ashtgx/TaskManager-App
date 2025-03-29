import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationButton from "./notifications/NotificationButton";

export default function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuth();

    // Don't show navbar on login or register
    if (location.pathname === "/" || location.pathname === "/register") {
        return null;
    }

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <nav className="bg-gray-800 text-white px-6 py-3 flex justify-between items-center">
            <button onClick={() => navigate("/dashboard")} className="text-xl font-semibold">
                TaskManager
            </button>
            <div className="flex gap-2 items-center">
                <NotificationButton />
                <button
                    onClick={() => navigate("/profile")}
                    className="bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded"
                >
                    Profile
                </button>
                <button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded"
                >
                    Logout
                </button>
            </div>
        </nav>
    );
}
