import { useNavigate } from "react-router-dom";
import LoginForm from "../../components/auth/LoginForm";

const LoginPage = () => {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
            <LoginForm />
            <button 
                onClick={() => navigate(`/register`)}
                className="mt-4 bg-green-400 text-black px-6 py-2 rounded hover:bg-green-500"
            >
                Don't have an account? Register
            </button>
        </div>
    );
};

export default LoginPage;