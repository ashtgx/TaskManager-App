import { useState } from "react";
import { useNavigate } from "react-router-dom";
import RegisterForm from "../../components/auth/RegisterForm";
import { registerUser, loginUser } from "../../api/auth";
import { useAuth } from "../../context/AuthContext";

export default function RegisterPage() {
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleRegister = async (formData) => {
        try {
            await registerUser(formData);
            await login({
                username: formData.username,
                password: formData.password,
            });
            navigate("/dashboard");
        } catch (err) {
            console.error(err)
            setError("Registration failed. Try again.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
            <RegisterForm onSubmit={handleRegister} error={error} />
            <button 
                onClick={() => navigate(`/`)}
                className="bg-green-400 text-black px-10 py-2 rounded hover:bg-green-500"
            >
                Already have an account? Login
            </button>
        </div>
    );
}