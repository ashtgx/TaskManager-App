import { useState } from "react";

export default function RegisterForm({ onSubmit, error }) {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
    });

    const handleChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form 
            onSubmit={handleSubmit} 
            className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-sm mx-auto mt-12"
        >
            <h2 className="text-2xl font-bold mb-4 text-center">Register</h2>
            <div className="mb-4">
                <label className="block text-gray-700 text-sm mb-2">Username</label>
                <input
                    type="text"
                    name="username"
                    onChange={handleChange}
                    value={formData.username}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight"
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 text-sm mb-2">Email</label>
                <input
                type="email"
                name="email"
                onChange={handleChange}
                value={formData.email}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight"
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 text-sm mb-2">Password</label>
                <input
                type="password"
                name="password"
                onChange={handleChange}
                value={formData.password}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight"
                />
            </div>
            {error && <p className="text-red-500">{error}</p>}
            <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
            >
                Register
            </button>
        </form>
    );
}