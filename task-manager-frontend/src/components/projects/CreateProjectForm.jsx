import { useState } from "react";
import { createProject } from "../../api/projects";

export default function CreateProjectForm({ onClose, onCreated }) {
    const [title, setTitle] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createProject({ title });
            onCreated();
            onClose();
        } catch (err) {
            setError("Failed to create project.");
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow w-full max-w-sm relative">
                <h2 className="text-xl font-semibold mb-4">Create New Project</h2>
                {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
                
                <input
                    type="text"
                    placeholder="Project Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full border rounded px-3 py-2 mb-4"
                    required
                />

                <div className="flex justify-end gap-2">
                    <button type="button" onClick={onClose} className="px-3 py-1 bg-gray-400 text-white rounded">
                        Cancel
                    </button>
                    <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded">
                        Create
                    </button>
                </div>

                <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-black text-lg">&times;</button>
            </form>
        </div>
    );
}