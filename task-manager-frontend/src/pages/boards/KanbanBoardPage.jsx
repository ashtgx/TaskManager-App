import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DndContext, closestCorners, PointerSensor, useSensor, useSensors, DragOverlay } from "@dnd-kit/core";
import { arrayMove, SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { getProjectDetail } from "../../api/projects";
import { getKanbanBoard, getKanbanColumns, updateKanbanColumn, deleteKanbanColumn , updateKanbanTask, deleteKanbanTask } from "../../api/boards";
import SortableKanbanColumn from "../../components/boards/SortableKanbanColumn";
import KanbanTaskCard from "../../components/boards/KanbanTaskCard";
import AddKanbanColumnForm from "../../components/boards/AddKanbanColumnForm";

export default function KanbanBoardPage() {
    const { projectID, boardID } = useParams();
    const [project, setProject] = useState(null);
    const [board, setBoard] = useState(null);
    const [columns, setColumns] = useState([]);
    const [showAddColumn, setShowAddColumn] = useState(false);
    const [activeColumn, setActiveColumn] = useState(null);
    const [activeTask, setActiveTask] = useState(null);
    const navigate = useNavigate();

    const sensors = useSensors(useSensor(PointerSensor));

    const loadData = async () => {
        try {
            const [projectData, boardData, columnData] = await Promise.all([
                getProjectDetail(projectID),
                getKanbanBoard(projectID, boardID),
                getKanbanColumns(projectID, boardID)
            ]);
            setProject(projectData);
            setBoard(boardData);
            setColumns(columnData);
        } catch (err) {
            console.error("Failed to load board", err);
        }
    };

    const handleDragStart = ({ active }) => {
        const id = active.id;

        // If dragging a task
        if (typeof id === "string" && id.startsWith("task-")) {
            for (const col of columns) {
                const task = col.kanban_tasks.find((t) => `task-${t.id}` === id);
                if (task) {
                    setActiveTask(task);
                    return;
                }
            }
        }

        // If dragging a column
        if (typeof id === "string" && id.startsWith("column-")) {
            const column = columns.find((c) => `column-${c.id}` === id);
            if (column) {
                setActiveColumn(column);
            }
        }
    };

    const handleDragEnd = async ({ active, over }) => {
        if (!over || active.id === over.id) return;

        const isColumnDrag = columns.some(col => `column-${col.id}` === active.id);

        if (isColumnDrag) {
            // Column drag
            const oldIndex = columns.findIndex(col => `column-${col.id}` === active.id);
            const newIndex = columns.findIndex(col => `column-${col.id}` === over.id);
            const newOrder = arrayMove(columns, oldIndex, newIndex);
            setColumns(newOrder);

            try {
                for (let i = 0; i < newOrder.length; i++) {
                    await updateKanbanColumn(projectID, boardID, newOrder[i].id, { order: i });
                }
            } catch (err) {
                console.error("Failed to persist column order", err);
            }
        } else {
            // Task drag
            let sourceColumnId = null;
            let targetColumnId = null;
            let taskBeingMoved = null;

            for (const col of columns) {
                const foundTask = col.kanban_tasks.find(t => `task-${t.id}` === active.id);
                if (foundTask) {
                    sourceColumnId = col.id;
                    taskBeingMoved = foundTask;
                }

                if (
                    `column-${col.id}` === over?.id ||
                    col.kanban_tasks.some(t => `task-${t.id}` === over?.id)
                ) {
                    targetColumnId = col.id;
                }
            }

            if (!taskBeingMoved || !targetColumnId) return;

            const updatedColumns = columns.map(col => ({
                ...col,
                kanban_tasks: [...col.kanban_tasks],
            }));

            const sourceColumn = updatedColumns.find(col => col.id === sourceColumnId);
            const targetColumn = updatedColumns.find(col => col.id === targetColumnId);

            sourceColumn.kanban_tasks = sourceColumn.kanban_tasks.filter(task => `task-${task.id}` !== active.id);

            const overIndex = targetColumn.kanban_tasks.findIndex(task => `task-${task.id}` === over.id);
            const insertIndex = overIndex === -1 ? targetColumn.kanban_tasks.length : overIndex;

            targetColumn.kanban_tasks.splice(insertIndex, 0, taskBeingMoved);

            setColumns(updatedColumns);

            try {
                for (let i = 0; i < targetColumn.kanban_tasks.length; i++) {
                    await updateKanbanTask(projectID, boardID, targetColumn.id, targetColumn.kanban_tasks[i].id, {
                        order: i,
                        kanban_column: targetColumn.id,
                    });
                }
            } catch (err) {
                console.error("Failed to persist task order/column change", err);
            }

        }

        setActiveColumn(null);
        setActiveTask(null);
    };

    const handleDeleteColumn = async (columnID) => {
        if (!window.confirm("Are you sure you want to delete this column and its tasks?")) return;

        try {
            await deleteKanbanColumn(projectID, boardID, columnID);
            await loadData();
        } catch (err) {
            console.error("Failed to delete column", err);
            alert("Failed to delete column.");
        }
    };

    const handleDeleteTask = async (columnID, taskID) => {
        if (!window.confirm("Are you sure you want to delete this task?")) return;
        try {
            await deleteKanbanTask(projectID, boardID, columnID, taskID);
            await loadData();
        } catch (err) {
            console.error("Failed to delete task", err);
            alert("Failed to delete task.");
        }
    };

    const handleUpdateColumnTitle = async (columnId, newTitle) => {
        try {
            await updateKanbanColumn(projectID, boardID, columnId, { title: newTitle });
            await loadData();
        } catch (err) {
            console.error("Failed to update column title", err);
            alert("Could not update title.");
        }
    };

    useEffect(() => {
        loadData();
    }, [projectID, boardID]);

    if (!project || !board) return <p>Loading...</p>;

    return (
        <>
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
                <div className="overflow-x-auto">
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCorners}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={columns.map((col) => `column-${col.id}` )}
                            strategy={horizontalListSortingStrategy}
                        >
                            <div className="flex gap-4">
                                {columns.map((col) => (
                                    <SortableKanbanColumn
                                        key={col.id}
                                        column={col}
                                        projectID={projectID}
                                        boardID={boardID}
                                        project={project}
                                        onReload={loadData}
                                        onTaskDelete={handleDeleteTask}
                                        onColumnDelete={handleDeleteColumn}
                                        onColumnTitleUpdate={handleUpdateColumnTitle}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                        <DragOverlay>
                            {activeTask ? (
                                <KanbanTaskCard
                                    task={activeTask}
                                />
                            ) : null}
                            {activeColumn ? (
                                <SortableKanbanColumn
                                    column={activeColumn}
                                />
                            ) : null}
                        </DragOverlay>
                    </DndContext>
                </div>
            </div>
            <div className="flex justify-end mb-4">
                <button
                    onClick={() => setShowAddColumn(true)}
                    className="fixed top-22 right-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 z-40"
                >
                    + Add Column
                </button>
            </div>
            {showAddColumn && (
                <AddKanbanColumnForm
                    projectID={projectID}
                    boardID={boardID}
                    onClose={() => setShowAddColumn(false)}
                    onSuccess={loadData}
                />
            )}
        </>
    );
}