import axios from "axios";

export const API = axios.create({ baseURL: "http://localhost:8000/api/" });

API.interceptors.request.use((config) => {
    const accessToken = localStorage.getItem("access");
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
});

export const loginUser = (credentials) => API.post("users/login/", credentials);

export const refreshToken = (data) => API.post("users/token/refresh/", data);

export const registerUser = (data) => API.post("users/register/", data);

export const fetchProfile = () => API.get("users/profile/");

export const updateProfile = (profileData) => API.put("users/profile/", profileData,);