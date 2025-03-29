import { useEffect, useState, useRef } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function GanttTaskRow({ task, projectID, boardID, extendedStartDate, extendedEndDate, pxPerDay, onDateChange, onReload, setEditingTask, onDelete }) {
    const { setNodeRef, attributes, listeners, transform, transition } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const [dragOffsetDays, setDragOffsetDays] = useState(0);
    const [isDraggingBar, setIsDraggingBar] = useState(false);
    const barRef = useRef(null);
    const dragStartX = useRef(null);

    const originalStartDate = new Date(task.start_date);
    const originalEndDate = new Date(task.end_date);
    const startOffsetDays = Math.floor((originalStartDate - extendedStartDate) / (1000 * 60 * 60 * 24));
    const totalDays = Math.floor((originalEndDate - originalStartDate) / (1000 * 60 * 60 * 24)) + 1;
    const totalChartDays = Math.floor((extendedEndDate - extendedStartDate) / (1000 * 60 * 60 * 24)) + 1;
    const barLeft = (startOffsetDays + dragOffsetDays) * pxPerDay;
    const barWidth = totalDays * pxPerDay;

    const handleBarMouseDown = (e) => {
        dragStartX.current = e.clientX;
        setIsDraggingBar(true);
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isDraggingBar || dragStartX.current === null) return;

            const deltaPixels = e.clientX - dragStartX.current;
            const deltaDays = Math.round(deltaPixels / pxPerDay);
            setDragOffsetDays(deltaDays);
        };

        const handleMouseUp = async () => {
            if (!isDraggingBar || dragOffsetDays === 0) {
                setIsDraggingBar(false);
                setDragOffsetDays(0);
                dragStartX.current = null;
                return;
            }

            const newStart = new Date(originalStartDate);
            const newEnd = new Date(originalEndDate);
            newStart.setDate(newStart.getDate() + dragOffsetDays);
            newEnd.setDate(newEnd.getDate() + dragOffsetDays);

            try {
                await onDateChange(projectID, boardID, task.id, {
                    title: task.title,
                    assigned_to_id: task.assigned_to?.id || null,
                    start_date: newStart.toISOString().split("T")[0],
                    end_date: newEnd.toISOString().split("T")[0],
                });
                onReload();
            } catch (err) {
                console.error("Failed to update task dates", err);
            }

            setIsDraggingBar(false);
            setDragOffsetDays(0);
            dragStartX.current = null;
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isDraggingBar, dragOffsetDays]);

    return (
        <div ref={setNodeRef} style={style}>
            <div className="flex items-center min-h-12 border-b" style={{ width: `${188+((totalChartDays) * pxPerDay)}px`}}>
                <button
                    {...attributes}
                    {...listeners}
                    className="cursor-grab text-gray-600 text-lg mx-2 w-3"
                    title="Drag row"
                >
                    ⠿
                </button>
                <span 
                    className="relative flex-col content-center min-w-40 max-w-40 h-12 border-r"
                    onClick={() => setEditingTask(task)}
                >
                    {task.title}
                    {task.assigned_to && (
                        <p className="text-xs text-gray-500">Assigned to: {task.assigned_to.username}</p>
                    )}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(task.id);
                        }}
                        className="absolute text-sm p-1 top-0 right-0 text-red-600 hover:text-red-800"
                    >
                        &times;
                    </button>
                </span>
                <div className="relative flex-1">
                    <div
                        className="absolute -top-2 left-0 bottom-0 z-0 flex"
                        style={{
                            width: `${(totalChartDays) * pxPerDay}px`,
                        }}
                    >
                        {Array.from({ length: totalChartDays }).map((_, i) => (
                            <div
                                key={i}
                                className="h-12 border-r border-gray-300"
                                style={{ width: `${pxPerDay}px` }}
                            />
                        ))}
                    </div>

                    <div
                            ref={barRef}
                            onMouseDown={handleBarMouseDown}
                            className="relative z-10 h-8 rounded bg-blue-500 cursor-ew-resize transition-all duration-200"
                            style={{
                                left: `${barLeft}px`,
                                width: `${barWidth}px`,
                            }}
                        />
                    </div>
                </div>
        </div>
    );
}