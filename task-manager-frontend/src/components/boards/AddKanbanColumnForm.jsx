import { useState } from "react";
import { createKanbanColumn } from "../../api/boards";

export default function AddKanbanColumnForm({ projectID, boardID, onClose, onSuccess }) {
    const [title, setTitle] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (title.trim() === "") return;

        try {
            await createKanbanColumn(projectID, boardID, { title });
            onSuccess();
            onClose();
        } catch (err) {
            console.error("Failed to create column", err);
            alert("Failed to create column.");
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0,0,0,0.5)'}}>
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow w-96">
                <h2 className="text-lg font-semibold mb-4">New Column</h2>
                <input
                    className="w-full p-2 border rounded mb-4"
                    value={title}
                    max_length={15}
                    onChange={(e) => setTitle(e.target.value.slice(0, 16))}
                    placeholder="Column title"
                    required
                />
                <div className="flex justify-end gap-2">
                    <button type="button" onClick={onClose} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
                    <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Create</button>
                </div>
            </form>
        </div>
    );
}
