import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function LoginForm() {
    const { login } = useAuth();
    const [formData, setFormData] = useState({ username: "", password: "" });
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            await login(formData);
            navigate("/dashboard");
        } catch (err) {
            setError("Invalid credentials. Please try again.");
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-sm mx-auto mt-12"
        >
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <div className="mb-4">
            <label className="block text-gray-700 text-sm mb-2">Username</label>
            <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight"
                required
            />
        </div>

        <div className="mb-6">
            <label className="block text-gray-700 text-sm mb-2">Password</label>
            <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight"
                required
            />
        </div>

        <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded w-full"
        >
            Login
        </button>
        </form>
    );
};
