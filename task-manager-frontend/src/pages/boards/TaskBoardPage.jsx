import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { getTaskBoard, getTaskBoardTasks, deleteTaskBoardTask, reorderTaskBoardTasks } from "../../api/boards";
import { getProjectDetail } from "../../api/projects";
import AddTaskBoardTaskForm from "../../components/boards/AddTaskBoardTaskForm";
import EditTaskBoardTaskForm from "../../components/boards/EditTaskBoardTaskForm";

const STATUS_LABELS = {
    TODO: "To Do",
    IN_PROGRESS: "In Progress",
    DONE: "Done"
};

function SortableTask({ task, onSelect, onDelete }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        setActivatorNodeRef,
        transform,
        transition
    } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition
    };

    return (
        <li
            ref={setNodeRef}
            style={style}
            className="border p-3 rounded hover:bg-gray-100 flex justify-between items-center"
        >
            <div
                ref={setActivatorNodeRef}
                {...attributes}
                {...listeners}
                className="w-4 h-full flex items-center justify-center font-bold cursor-grab rounded mr-4"
                title="Drag to reorder"
                onClick={(e) => e.stopPropagation()}
            >
                ⠿
            </div>
            <div
                className="flex-1 cursor-pointer"
                onClick={() => onSelect(task)}
            >
                <strong>{task.title}</strong> – {STATUS_LABELS[task.status]}
                <p className="w-full line-clamp-2">{task.description}</p>
                {task.assigned_to && (
                    <p className="text-sm text-gray-600">
                        Assigned to: {task.assigned_to.username}
                    </p>
                )}
            </div>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete(task.id);
                }}
                className="ml-4 px-2 py-1 bg-red-500 text-white rounded"
            >
                Delete
            </button>
        </li>
    );
}

export default function TaskBoardPage() {
    const { projectID, boardID } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [board, setBoard] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [showAddTask, setShowAddTask] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);

    const loadProject = async () => {
        try {
            const data = await getProjectDetail(projectID);
            setProject(data);
        } catch (err) {
            console.error("Failed to load project", err);
        }
    };

    const loadBoard = async () => {
        try {
            const data = await getTaskBoard(projectID, boardID);
            setBoard(data);
        } catch (err) {
            console.error("Failed to fetch task board", err);
        }
    };

    const loadTasks = async () => {
        try {
            const data = await getTaskBoardTasks(projectID, boardID);
            setTasks(data);
        } catch (err) {
            console.error("Failed to fetch tasks", err);
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (!window.confirm("Are you sure you want to delete this task?")) return;
        try {
            await deleteTaskBoardTask(projectID, boardID, taskId);
            await loadTasks();
        } catch (err) {
            console.error("Failed to delete task", err);
            alert("Failed to delete task.");
        }
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
    
        const oldIndex = tasks.findIndex((t) => t.id === active.id);
        const newIndex = tasks.findIndex((t) => t.id === over.id);
        const newTasks = arrayMove(tasks, oldIndex, newIndex);
        setTasks(newTasks);
        
        try {
            const newOrder = newTasks.map((task) => task.id);
            await reorderTaskBoardTasks(projectID, boardID, newOrder);
        } catch (err) {
            console.error("Failed to persist new order", err)
        }
    };

    const sensors = useSensors(useSensor(PointerSensor));

    useEffect(() => {
        loadProject();
        loadBoard();
        loadTasks();
    }, [projectID, boardID]);

    if (!project || !board) return <p>Loading task board...</p>;

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
            <h1 className="text-2xl font-bold">{board.title}</h1>
            <p className="mb-4 text-gray-700">Project: {project.title}</p>

            <div className="flex justify-end mb-4">
                <button
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    onClick={() => setShowAddTask(true)}
                >
                    + Add Task
                </button>
            </div>

            <h2 className="text-xl font-semibold mt-6 mb-2">Tasks</h2>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                    <ul className="space-y-2 relative">
                        {tasks.map((task) => (
                            <SortableTask
                                key={task.id}
                                task={task}
                                onSelect={setSelectedTask}
                                onDelete={handleDeleteTask}
                            />
                        ))}
                    </ul>
                </SortableContext>
            </DndContext>

            {showAddTask && (
                <AddTaskBoardTaskForm
                    boardID={boardID}
                    projectID={projectID}
                    project={project}
                    onClose={() => setShowAddTask(false)}
                    onSave={loadTasks}
                />
            )}

            {selectedTask && (
                <EditTaskBoardTaskForm
                    task={selectedTask}
                    onClose={() => setSelectedTask(null)}
                    onSave={loadTasks}
                    projectID={projectID}
                    boardID={boardID}
                    project={project}
                />
            )}
        </div>
    );
}