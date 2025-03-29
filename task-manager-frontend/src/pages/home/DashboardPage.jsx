import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ProjectList from "../../components/projects/ProjectList";
import CreateProjectForm from "../../components/projects/CreateProjectForm";
import NotificationButton from "../../components/notifications/NotificationButton";

export default function DashboardPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [reloadFlag, setReloadFlag] = useState(false);

    useEffect(() => {
        if (!user) return navigate("/");
    });

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold">Welcome, {user?.username}</h1>
            </div>
            <div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded mb-4"
                >
                    + Create Project
                </button>
                <ProjectList reloadFlag={reloadFlag} />
            </div>
            {showCreateModal && (
                <CreateProjectForm
                    onClose={() => setShowCreateModal(false)}
                    onCreated={() => {
                        setReloadFlag(!reloadFlag);
                    }}
                />
            )}
        </div>
    );
}