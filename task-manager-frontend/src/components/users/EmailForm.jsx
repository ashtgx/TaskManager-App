import { useState } from "react";
import { updateProfile } from "../../api/auth";
import { useAuth } from "../../context/AuthContext";

const EmailForm = ({ currentEmail, token, onClose }) => {
    const [email, setEmail] = useState(currentEmail);
    const [error, setError] = useState("");
    const { fetchUserProfile } = useAuth(); // optional if you want to refresh context

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
        await updateProfile(token, { email });
        if (fetchUserProfile) await fetchUserProfile(); // refresh context data if needed
        onClose();
        } catch (err) {
        console.error(err.response?.data || err.message);
        setError("Failed to update email");
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0,0,0,0.5)'}}>
        <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Update Email</h2>
            <form onSubmit={handleSubmit}>
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border p-2 mb-4"
                required
            />
            {error && <p className="text-red-500 mb-2">{error}</p>}
            <div className="flex justify-end space-x-2">
                <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border rounded"
                >
                Cancel
                </button>
                <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                Save
                </button>
            </div>
            </form>
        </div>
        </div>
    );
};

export default EmailForm;