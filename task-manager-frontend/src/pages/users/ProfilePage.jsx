import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import EmailForm from "../../components/users/EmailForm";

const ProfilePage = () => {
    const { user, token } = useAuth();
    const [showModal, setShowModal] = useState(false);

    return (
        <div className="p-8 max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Profile</h1>
        <div className="bg-white shadow-md rounded p-6">
            <p className="mb-2">
            <span className="font-semibold">Username:</span> {user?.username}
            </p>
            <p className="mb-4">
            <span className="font-semibold">Email:</span> {user?.email}
            </p>
            <button
            onClick={() => setShowModal(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
            Edit Email
            </button>
        </div>

        {showModal && (
            <EmailForm
            currentEmail={user?.email}
            token={token}
            onClose={() => setShowModal(false)}
            />
        )}
        </div>
    );
};

export default ProfilePage;