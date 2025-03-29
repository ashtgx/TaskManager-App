import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProjectDetail } from "../../api/projects";
import { getTaskBoards, getKanbanBoards, getGanttBoards } from "../../api/boards";
import InviteCollaboratorForm from "../../components/projects/InviteCollaboratorForm";
import { handleDeleteProject, handleLeaveProject } from "../../utils/projectActions";
import TaskBoardList from "../../components/boards/TaskBoardList";
import KanbanBoardList from "../../components/boards/KanbanBoardList";
import GanttBoardList from "../../components/boards/GanttBoardList";
import AddBoardForm from "../../components/boards/AddBoardForm";
import { useAuth } from "../../context/AuthContext";


export default function ProjectDetailPage() {
    const { projectID } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [project, setProject] = useState(null);
    const [taskBoards, setTaskBoards] = useState([]);
    const [kanbanBoards, setKanbanBoards] = useState([]);
    const [ganttBoards, setGanttBoards] = useState([]);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showAddBoardModal, setShowAddBoardModal] = useState(false);

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

    const loadBoards = async () => {
        try {
          const [tasks, kanbans, gantts] = await Promise.all([
            getTaskBoards(projectID),
            getKanbanBoards(projectID),
            getGanttBoards(projectID),
          ]);
          setTaskBoards(tasks);
          setKanbanBoards(kanbans);
          setGanttBoards(gantts);
        } catch (err) {
          console.error("Failed to load boards", err);
        }
      };

    useEffect(() => { 
        loadProject(); 
        loadBoards();
    }, [projectID]);

    const handleDelete = () => {
            handleDeleteProject(project.id, project.title, null, navigate);
        };
        
    const handleLeave = () => {
        handleLeaveProject(project.id, project.title, null, navigate);
    };
    

    return (
        <div className="p-6">
            <div className="mb-4">
                <button
                    onClick={() => navigate("/dashboard")}
                    className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
                >
                    ← Back to Dashboard
                </button>
            </div>
            {project && (
                <>
                    <h1 className="text-2xl font-bold mb-4">Project: {project?.title}</h1>
                    <div className="flex justify-between mb-4">
                        <button
                            onClick={() => navigate(`/projects/${project.id}/collaborators`)}
                            className="px-4 py-2 bg-purple-500 text-white rounded"
                        >
                            View Collaborators
                        </button>
                        <button
                            onClick={() => navigate(`/projects/${projectID}/chat`)}
                            className="px-4 py-2 bg-indigo-500 text-white rounded"
                        >
                            Open Project Chat
                        </button>
                        {isCreator && (
                            <button
                                onClick={() => setShowInviteModal(true)}
                                className="bg-green-600 text-white px-4 py-2 rounded"
                            >
                                Invite Collaborator
                            </button>
                        )}
                        <button
                            onClick={handleLeave}
                            className="px-4 py-2 bg-orange-500 text-white rounded"
                        >
                            Leave Project
                        </button>
                        {isCreator && (
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded"
                            >
                                Delete Project
                            </button>
                        )}
                    </div>

                    <p><strong>Creator:</strong> {project?.creator?.username}</p>
                    <div className="my-4">
                        <button
                            onClick={() => setShowAddBoardModal(true)}
                            className="px-4 py-2 bg-blue-500 text-white rounded"
                        >
                            + Add Board
                        </button>
                    </div>
                    <div>
                        <TaskBoardList projectID={project.id} boards={taskBoards} onReload={loadBoards} />
                        <KanbanBoardList projectID={project.id} boards={kanbanBoards} onReload={loadBoards} />
                        <GanttBoardList projectID={project.id} boards={ganttBoards} onReload={loadBoards} />
                    </div>
                </>
            )}
            
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
            {showAddBoardModal && (
                <AddBoardForm
                    projectID={project.id}
                    onClose={() => setShowAddBoardModal(false)}
                    onCreated={loadBoards}
                />
            )}
        </div>
    );
}