import { useState } from "react";
import { createTaskBoard, createKanbanBoard, createGanttBoard } from "../../api/boards";

export default function AddBoardForm({ projectID, onClose, onCreated }) {
    const [boardType, setBoardType] = useState("task");
    const [title, setTitle] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (boardType === "task") {
                await createTaskBoard(projectID, { title });
            } else if (boardType === "kanban") {
                await createKanbanBoard(projectID, { title });
            } else if (boardType === "gantt") {
                await createGanttBoard(projectID, { title });
            }
            onCreated(); // reload project boards
            onClose();
        } catch (err) {
            console.error("Failed to create board", err);
            alert("Board creation failed.");
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-lg w-[90%] max-w-sm relative">
                <h3 className="text-lg font-semibold mb-4">Create New Board</h3>

                <label className="block mb-2 font-medium">Board Type:</label>
                <select
                    value={boardType}
                    onChange={(e) => setBoardType(e.target.value)}
                    className="w-full mb-4 border p-2 rounded"
                >
                    <option value="task">Task Board</option>
                    <option value="kanban">Kanban Board</option>
                    <option value="gantt">Gantt Board</option>
                </select>

                <label className="block mb-2 font-medium">Title:</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full mb-4 border p-2 rounded"
                />

                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
                    >
                        Cancel
                    </button>
                    <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded">
                        Create
                    </button>
                </div>

                <button
                    onClick={onClose}
                    type="button"
                    className="absolute top-2 right-2 text-gray-500 hover:text-black"
                >
                    &times;
                </button>
            </form>
        </div>
    );
}
