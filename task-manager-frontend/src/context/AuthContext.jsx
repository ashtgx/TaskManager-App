import { createContext, useContext, useEffect, useState } from "react"
import { jwtDecode } from "jwt-decode";
import { loginUser, refreshToken, fetchProfile } from "../api/auth"

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [access, setAccess] = useState(localStorage.getItem("access"));
    const [refresh, setRefresh] = useState(localStorage.getItem("refresh"));
    const [user, setUser] = useState(access ? jwtDecode(access) : null);

    const login = async (credentials) => {
        const res = await loginUser(credentials);
        const data = res.data;
        setAccess(data.access);
        setRefresh(data.refresh);
        localStorage.setItem("access", data.access);
        localStorage.setItem("refresh", data.refresh);
        try {
            const profileRes = await fetchProfile();
            setUser(profileRes.data);
        } catch (err) {
            console.error("Failed to fetch user profile after login", err);
        }

    };

    const logout = () => {
        setAccess(null);
        setRefresh(null);
        setUser(null);
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
    };

    const refreshAccessToken = async () => {
        try {
            const res = await refreshToken({ refresh });
            setAccess(res.data.access);
            localStorage.setItem("access", res.data.access);
            const profileRes = await fetchProfile();
            setUser(profileRes.data);
        } catch {
            console.error("Refresh token failed", err);
            logout();
        }
    };

    const fetchUserProfile = async () => {
        const res = await fetchProfile();
        setUser(res.data);
      };

    useEffect(() => {
        if (access) {
            fetchUserProfile();
        }
        if (refresh) {
            const interval = setInterval(() => {
                refreshAccessToken();
            }, 5 * 60 * 1000); // 5 mins
            return () => clearInterval(interval);
        }
    }, [refresh]);

    
    return (
        <AuthContext.Provider 
            value={{
                user, 
                access, 
                refresh,
                login, 
                logout,
                refreshAccessToken,
                fetchUserProfile
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

