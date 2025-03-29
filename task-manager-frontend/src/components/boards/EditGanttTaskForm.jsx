import { useState } from "react";
import { updateGanttTask } from "../../api/boards";

export default function EditGanttTaskForm({ task, projectID, boardID, project, onClose, onSave }) {
    const [title, setTitle] = useState(task.title);
    const [assignedTo, setAssignedTo] = useState(task.assigned_to?.id || "");
    const [startDate, setStartDate] = useState(task.start_date);
    const [endDate, setEndDate] = useState(task.end_date);

    const usersInProject = [
        ...(project?.creator ? [project.creator] : []),
        ...(project?.collaborators || []),
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateGanttTask(projectID, boardID, task.id, {
                title,
                assigned_to_id: assignedTo || null,
                start_date: startDate,
                end_date: endDate,
            });
            alert("Task Updated.")
            onSave();
            onClose();
        } catch (err) {
            console.error("Failed to update Gantt task", err);
            alert("Update failed.");
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-lg w-96">
                <h2 className="text-xl font-bold mb-4">Edit Gantt Task</h2>

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
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
}