import { useState } from "react";
import { CSS } from "@dnd-kit/utilities";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import KanbanTaskCard from "./KanbanTaskCard";
import AddKanbanTaskForm from "./AddKanbanTaskForm";
import EditKanbanTaskForm from "./EditKanbanTaskForm";

export default function SortableKanbanColumn({ column, projectID, boardID, project, onReload, onTaskDelete, onColumnTitleUpdate, onColumnDelete }) {
    const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({ id: `column-${column.id}` });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const tasks = column.kanban_tasks || [];
    const [title, setTitle] = useState(column.title);
    const [showAddTask, setShowAddTask] = useState(false);
    const [editingTask, setEditingTask] = useState(null);

    const handleBlur = () => {
        if (title.trim() && title !== column.title) {
            onColumnTitleUpdate(column.id, title.trim());
        }
    };

    return (
        <div 
            ref={setNodeRef} 
            style={style} 
            className={`bg-gray-100 p-4 rounded shadow min-w-[250px] mb-4`}
        >
            <div className="mb-2 flex items-center justify-between">
                <button
                    {...attributes}
                    {...listeners}
                    className="cursor-grab text-gray-600 text-lg mr-3"
                    title="Drag column"
                >
                    ⠿
                </button>
                <input
                    className="font-bold text-lg w-full bg-transparent border-none outline-none"
                    value={title}
                    maxLength={15}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={handleBlur}
                />
                <button
                    onClick={() => onColumnDelete(column.id)}
                    className="text-red-600 hover:text-red-800 ml-2 text-xl"
                    title="Delete column"
                >
                    &times;
                </button>
            </div>

            <SortableContext items={tasks.map((task) => `task-${task.id}` )} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                    {tasks.map((task) => (
                        <KanbanTaskCard
                            key={task.id}
                            task={task}
                            onClick={() => setEditingTask(task)}
                            onDelete={() => onTaskDelete(column.id, task.id)}
                        />
                    ))}
                </div>
            </SortableContext>

            <div className="mt-4">
                <button
                    onClick={() => setShowAddTask(true)}
                    className="bg-indigo-500 text-white px-2 py-1 rounded hover:bg-indigo-600"
                >
                    + Add Task
                </button>
            </div>
            {showAddTask && (
                <AddKanbanTaskForm
                    onClose={() => setShowAddTask(false)}
                    onSave={onReload}
                    columnID={column.id}
                    boardID={boardID}
                    projectID={projectID}
                    project={project}
                />
            )}
            {editingTask && (
                <EditKanbanTaskForm
                    task={editingTask}
                    onClose={() => setEditingTask(null)}
                    onSave={onReload}
                    projectID={projectID}
                    boardID={boardID}
                    columnID={column.id}
                    project={project}
                />
            )}
        </div>
    );
}
