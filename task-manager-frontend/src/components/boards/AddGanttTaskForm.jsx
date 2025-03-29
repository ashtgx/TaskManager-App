import { useState } from "react";
import { createGanttTask } from "../../api/boards";

export default function AddGanttTaskForm({ projectID, boardID, project, onClose, onSave }) {
    const [title, setTitle] = useState("");
    const [assignedTo, setAssignedTo] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const usersInProject = [
        ...(project?.creator ? [project.creator] : []),
        ...(project?.collaborators || []),
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createGanttTask(projectID, boardID, {
                title,
                assigned_to_id: assignedTo || null,
                start_date: startDate,
                end_date: endDate,
            });
            onSave();
            onClose();
        } catch (err) {
            console.error("Failed to create Gantt task", err);
            alert("Failed to create task.");
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-lg w-96">
                <h2 className="text-xl font-bold mb-4">Add Gantt Task</h2>

                <label className="block mb-2">
                    Title:
                    <input
                        type="text"
                        value={title}
                        maxLength={15}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full border p-2 rounded"
                        required
                    />
                </label>

                <label className="block mb-2">
                    Assigned To:
                    <select
                        value={assignedTo}
                        onChange={(e) => setAssignedTo(e.target.value)}
                        className="w-full border p-2 rounded"
                    >
                        <option value="">Unassigned</option>
                        {usersInProject.map((user) => (
                            <option key={user.id} value={user.id}>
                                {user.username}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="block mb-2">
                    Start Date:
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full border p-2 rounded"
                        required
                    />
                </label>

                <label className="block mb-4">
                    End Date:
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full border p-2 rounded"
                        required
                        min={startDate}
                    />
                </label>

                <div className="flex justify-end gap-2">
                    <button type="button" onClick={onClose} className="bg-gray-400 text-white px-4 py-2 rounded">
                        Cancel
                    </button>
                    <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
                        Create
                    </button>
                </div>
            </form>
        </div>
    );
}