import { useNavigate } from "react-router"
import { useAuth } from "../../context/AuthContext";
import { handleDeleteProject, handleLeaveProject } from "../../utils/projectActions";

export default function ProjectCard({ project, onRefresh }) {
    const { user } = useAuth();
    const navigate = useNavigate();

    const isCreator = user && project.creator.username === user.username;

    const handleViewProject = () => {
        navigate(`/projects/${project.id}`);
    };

    return (
        <div className="border rounded p-4 shadow mb-4">
            <h2 className="text-lg font-semibold">{project.title}</h2>
            <p>Creator: {project.creator.username}</p>
            <p className="truncate">Collaborators: {project.collaborators.map((c) => c.username).join(", ")}</p>
  
            <div className="flex gap-2 mt-3 flex-wrap">
                <button onClick={handleViewProject} className="px-2 py-1 bg-gray-300 rounded">
                    View
                </button>
                <button
                    onClick={() => handleLeaveProject(project.id, project.title, onRefresh)}
                    className="px-2 py-1 bg-orange-500 text-white rounded"
                >
                    Leave Project
                </button>
  
                {isCreator && (
                    <>
                        <button
                            onClick={() => handleDeleteProject(project.id, project.title, onRefresh)}
                            className="px-2 py-1 bg-red-600 text-white rounded"
                        >
                            Delete Project
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}