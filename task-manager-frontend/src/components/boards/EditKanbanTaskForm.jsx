import { useState } from "react";
import { updateKanbanTask } from "../../api/boards";

export default function EditKanbanTaskForm({ task, onClose, onSave, projectID, boardID, columnID, project }) {
    const [title, setTitle] = useState(task.title || "");
    const [description, setDescription] = useState(task.description || "");
    const [assignedTo, setAssignedTo] = useState(task.assigned_to?.id || "");

    const usersInProject = [
        ...(project?.creator ? [project.creator] : []),
        ...(project?.collaborators || []),
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        const taskData = {
            title,
            description,
            assigned_to_id: assignedTo === "" ? null: assignedTo,
        };
        try {
            await updateKanbanTask(projectID, boardID, columnID, task.id, taskData);
            alert("Task updated.");
            onSave();
            onClose();
        } catch (err) {
            console.error("Failed to update task", err);
            alert("Update failed.");
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-lg w-96">
                <h2 className="text-xl font-bold mb-4">Edit Task</h2>

                <label className="block mb-4">
                    Title:
                    <input
                        value={title}
                        maxLength={15}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full border p-2 rounded"
                        required
                    />
                </label>

                <label className="block mb-4">
                    Description:
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full border p-2 rounded"
                    />
                </label>

                <label className="block mb-4">
                    Assigned To:
                    <select
                        value={assignedTo ?? ""}
                        onChange={(e) => setAssignedTo(e.target.value === "" ? null : parseInt(e.target.value))}
                        className="w-full border p-2 rounded"
                    >
                        <option value="">Unassigned</option>
                        {usersInProject.map(user => (
                            <option key={user.id} value={user.id}>
                                {user.username}
                            </option>
                        ))}
                    </select>
                </label>

                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="bg-gray-400 text-white px-4 py-2 rounded"
                    >
                        Cancel
                    </button>
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                        Save
                    </button>
                </div>
            </form>
        </div>
    );
}