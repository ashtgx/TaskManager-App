import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DndContext, useSensor, useSensors, PointerSensor, closestCenter } from "@dnd-kit/core";
import { SortableContext, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { getGanttBoard, getGanttTasks, updateGanttTask, deleteGanttTask } from "../../api/boards";
import { getProjectDetail } from "../../api/projects"
import GanttTaskRow from "../../components/boards/GanttTaskRow"
import GanttTimelineHeader from "../../components/boards/GanttTimelineHeader";
import AddGanttTaskForm from "../../components/boards/AddGanttTaskForm";
import EditGanttTaskForm from "../../components/boards/EditGanttTaskForm";

export default function GanttBoardPage() {
    const { projectID, boardID } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [board, setBoard] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [showAddTask, setShowAddTask] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const today = new Date();
    const allDates = tasks.length > 0
        ? tasks.flatMap(t => [new Date(t.start_date), new Date(t.end_date)])
        : [today, new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)]; // 30 days later
    const chartStartDate = new Date(Math.min(...allDates));
    const chartEndDate = new Date(Math.max(...allDates));
    const extendedStartDate = new Date(chartStartDate);
    extendedStartDate.setDate(extendedStartDate.getDate() - 10);
    const extendedEndDate = new Date(chartEndDate);
    extendedEndDate.setDate(extendedEndDate.getDate() + 10);
    const pxPerDay = 20;

    const sensors = useSensors(useSensor(PointerSensor));

    const loadData = async () => {
        try { 
            const [projectData, boardData, taskData] = await Promise.all([
                getProjectDetail(projectID),
                getGanttBoard(projectID, boardID),
                getGanttTasks(projectID, boardID),
            ]);
            setProject(projectData);
            setBoard(boardData);
            setTasks(taskData);
        } catch (err) {
            console.error("Failed to load Gantt board data", err);
        }
    };

    const handleDragEnd = async ({ active, over }) => {
        if (!over || active.id === over.id) return;
        const oldIndex = tasks.findIndex((task) => task.id === active.id);
        const newIndex = tasks.findIndex((task) => task.id === over.id);
        const newOrder = arrayMove(tasks, oldIndex, newIndex)
        setTasks(newOrder);

        try { 
            for (let i = 0; i < newOrder.length; i++) {
                await updateGanttTask(projectID, boardID, newOrder[i].id, { order: i });
            }
        } catch (err) {
            console.error("Failed to update Gantt task order", err);
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (!window.confirm("Are you sure you want to delete this task?")) return;
        try {
            await deleteGanttTask(projectID, boardID, taskId);
            await loadData();
        } catch (err) {
            console.error("Failed to delete task", err);
            alert("Error deleting task.");
        }
    };

    useEffect(() => {
        loadData();
    }, [projectID, boardID]);

    if (!project || !board) return <p>Loading...</p>
     
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
        
            <h1 className="text-2xl font-bold mb-1">{board.title}</h1>
            <p className="mb-4 text-gray-600">Project: {project.title}</p>
            <div className="overflow-x-auto">
                {tasks.length > 0 && (
                    <GanttTimelineHeader
                        extendedStartDate={extendedStartDate}
                        extendedEndDate={extendedEndDate}
                        pxPerDay={pxPerDay}
                    />
                )}
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
                        {tasks.map((task) => (
                            <GanttTaskRow
                                key={task.id}
                                task={task}
                                project={project}
                                projectID={projectID}
                                boardID={boardID}
                                extendedStartDate={extendedStartDate}
                                extendedEndDate={extendedEndDate}
                                pxPerDay={pxPerDay}
                                onDateChange={updateGanttTask}
                                onReload={loadData}
                                setEditingTask={setEditingTask}
                                onDelete={handleDeleteTask}
                            />
                        ))}
                    </SortableContext>
                </DndContext>
            </div>
            <div className="flex justify-end mb-4">
                <button
                    onClick={() => setShowAddTask(true)}
                    className="fixed top-22 right-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 z-40"
                >
                    + Add Task
                </button>
            </div>
            {showAddTask && (
                <AddGanttTaskForm
                    projectID={projectID}
                    boardID={boardID}
                    project={project}
                    onClose={() => setShowAddTask(false)}
                    onSave={loadData}
                />
            )}
            {editingTask && (
                <EditGanttTaskForm
                    task={editingTask}
                    boardID={boardID}
                    projectID={projectID}
                    project={project}
                    onClose={() => setEditingTask(null)}
                    onSave={loadData}
                />
            )}
        </div>
    );
}