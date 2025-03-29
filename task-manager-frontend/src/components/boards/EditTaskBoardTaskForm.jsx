import { useState } from "react";
import { updateTaskBoardTask } from "../../api/boards";

export default function EditTaskBoardTaskForm({ task, onClose, onSave, projectID, boardID, project }) {
    const [title, setTitle] = useState(task.title || "");
    const [description, setDescription] = useState(task.description || "");
    const [status, setStatus] = useState(task.status || "TODO");
    const [assignedTo, setAssignedTo] = useState(task.assigned_to?.id || null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const taskData = {
            title,
            description,
            status,
            assigned_to_id: assignedTo === "" ? null: assignedTo,
        };
        try {
            await updateTaskBoardTask(projectID, boardID, task.id, taskData);
            alert("Task updated.");
            onSave();
            onClose();
        } catch (err) {
            console.error(err);
            alert("Failed to update task.");
        }
    };

    const usersInProject = [
        ...(project?.creator ? [project.creator] : []),
        ...(project?.collaborators || [])
    ];

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0,0,0,0.5)'}}>
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-lg w-full max-w-md">
                <h2 className="text-lg font-semibold mb-4">Edit Task</h2>

                <label className="block mb-2">
                    Title:
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full border p-2 rounded"
                        required
                    />
                </label>

                <label className="block mb-2">
                    Description:
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full border p-2 rounded"
                    />
                </label>

                <label className="block mb-2">
                    Status:
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full border p-2 rounded"
                    >
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="DONE">Done</option>
                    </select>
                </label>

                <label className="block mb-4">
                    Assigned To:
                    <select
                        value={assignedTo ?? ""}
                        onChange={(e) => setAssignedTo(e.target.value === "" ? null : parseInt(e.target.value))}
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
                        className="px-4 py-2 rounded bg-gray-400 text-white"
                    >
                        Cancel
                    </button>
                    <button type="submit" className="px-4 py-2 rounded bg-green-500 text-white">
                        Save
                    </button>
                </div>
            </form>
        </div>
    );
}