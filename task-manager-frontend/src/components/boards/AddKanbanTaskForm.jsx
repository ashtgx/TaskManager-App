import { useState } from "react";
import { createKanbanTask } from "../../api/boards";

export default function AddKanbanTaskForm({ onClose, onSave, projectID, boardID, columnID, project }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [assignedTo, setAssignedTo] = useState("");

    const usersInProject = [
        ...(project?.creator ? [project.creator] : []),
        ...(project?.collaborators || []),
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createKanbanTask(projectID, boardID, columnID, {
                title,
                description,
                assigned_to_id: assignedTo ? parseInt(assignedTo) : null,
            });
            alert("Task created.");
            onSave();
            onClose();
        } catch (err) {
            console.error("Failed to create task", err);
            alert("Error creating task.");
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-lg w-96">
                <h2 className="text-xl font-semibold mb-4">Add Task</h2>

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

                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="bg-gray-300 text-black px-4 py-2 rounded"
                    >
                        Cancel
                    </button>
                    <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
                        Create
                    </button>
                </div>
            </form>
        </div>
    );
}