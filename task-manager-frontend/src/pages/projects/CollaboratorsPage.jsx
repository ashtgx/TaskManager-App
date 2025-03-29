import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProjectDetail } from "../../api/projects";
import InviteCollaboratorForm from "../../components/projects/InviteCollaboratorForm";
import { handleTransferOwnership, handleRemoveCollaborator } from "../../utils/projectActions";
import { useAuth } from "../../context/AuthContext";

export default function CollaboratorsPage() {
    const { projectID } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [showInviteModal, setShowInviteModal] = useState(false);

    const isCreator = project?.creator?.username === user?.username

    const loadProject = async () => {
        try {
            const data = await getProjectDetail(projectID);
            setProject(data);
        } catch (err) {
            console.error("Failed to load project", err);
            alert("Project not found");
            navigate("/dashboard");
        }
    };

    useEffect(() => { 
        loadProject(); 
    }, [projectID]);


    const handleTransfer = (collaborator) => {
        handleTransferOwnership(project.id, collaborator, loadProject);
        loadProject();
    };
    
    const handleRemove = (collaborator) => {
        handleRemoveCollaborator(project.id, collaborator, loadProject);
        loadProject();
    };

    return (
        <div className="p-6">
            <div className="mb-4">
                <button
                    onClick={() => navigate(`/projects/${projectID}`)}
                    className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
                >
                    ← Back to Project
                </button>
            </div>
            <h1 className="text-2xl font-semibold mb-4">
                Collaborators for "{project?.title}"
            </h1>

            <div className="flex gap-3 mt-4 mb-4">
                {isCreator && (
                    <button
                        onClick={() => setShowInviteModal(true)}
                        className="bg-green-600 text-white px-3 py-1 rounded"
                    >
                        Invite Collaborator
                    </button>
                )}
            </div>
            
            <ul className="mb-6">
                {project?.collaborators?.map((collab) => (
                <li key={collab.id} className="flex items-center py-1">
                    <span>{collab.username}</span>
                    {isCreator && (
                        <div className="flex gap-2 ml-2">
                            <button
                                onClick={() => handleTransfer(collab)}
                                className="text-sm px-2 py-1 bg-blue-500 text-white rounded"
                            >
                                Transfer Ownership
                            </button>
                            <button
                                onClick={() => handleRemove(collab)}
                                className="text-sm px-2 py-1 bg-yellow-500 text-black rounded"
                            >
                                Remove
                            </button>
                        </div>
                    )}
                </li>
                ))}
            </ul>
            
            {showInviteModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0,0,0,0.5)'}}>
                    <div className="bg-white p-6 rounded shadow-lg w-[90%] max-w-sm relative">
                        <h3 className="text-lg font-semibold mb-2">Invite Collaborator</h3>
                        <InviteCollaboratorForm
                            projectID={project.id}
                            onInvite={() => {
                                setShowInviteModal(false);
                                loadProject();
                            }}
                        />
                        <button
                            onClick={() => setShowInviteModal(false)}
                            className="absolute top-2 right-2 text-gray-500 hover:text-black"
                        >
                            &times;
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}