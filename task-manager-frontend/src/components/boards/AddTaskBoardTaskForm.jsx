import { useState } from "react";
import { createTaskBoardTask } from "../../api/boards";

export default function AddTaskBoardTaskForm({ boardID, projectID, project, onClose, onSave }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState("TODO");
    const [assignedTo, setAssignedTo] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        const taskData = {
            title,
            description,
            status,
            assigned_to_id: assignedTo ? parseInt(assignedTo) : null,
        };
        try {
            await createTaskBoardTask(projectID, boardID, taskData);
            alert("Task created.");
            onSave();
            onClose();
        } catch (err) {
            console.error(err);
            alert("Failed to create task.");
        }
    };

    const usersInProject = [
        ...(project?.creator ? [project.creator] : []),
        ...(project?.collaborators || [])
    ];

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0,0,0,0.5)'}}>
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow w-96">
                <h2 className="text-xl font-semibold mb-4">Add New Task</h2>

                <label className="block mb-4">
                    Title:
                    <input
                        value={title}
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
                        className="bg-gray-400 text-white px-4 py-2 rounded"
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