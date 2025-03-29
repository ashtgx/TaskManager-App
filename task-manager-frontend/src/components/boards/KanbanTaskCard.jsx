import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function KanbanTaskCard({ task, onClick, onDelete }) {
    const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({ id: `task-${task.id}` });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            className={`bg-white p-2 rounded shadow cursor-pointer`}
            style={style}
        >
            <div onClick={() => onClick(task)} className="flex">
                <button
                        {...attributes}
                        {...listeners}
                        onMouseDown={(e) => e.stopPropagation()}
                        className="cursor-grab text-gray-600 text-lg mr-2"
                        title="Drag task"
                    >
                        ⠿
                </button>
                <div className="relative flex flex-grow justify-between items-start">
                    <div>
                        <strong className="w-40">{task.title}</strong>
                        <p className="text-sm text-gray-600 w-40 line-clamp-2 ">{task.description}</p>
                        {task.assigned_to && (
                            <p className="text-xs text-gray-500 w-40">Assigned to: {task.assigned_to.username}</p>
                        )}
                    </div>
                    <button
                        onClick={() => {onDelete();}}
                        className="absolute top-0 right-0 text-red-600 hover:text-red-800"
                    >
                        &times;
                    </button>
                </div>
            </div>
        </div>
    );
}