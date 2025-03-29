import { useNavigate } from "react-router-dom";

export default function BoardCard({ board, link, onDelete }) {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(link);
    };

    const handleDeleteClick = (e) => {
        e.stopPropagation();
        if (confirm(`Are you sure you want to delete board "${board.title}"?`)) {
            onDelete(board.id);
        }
    };

    return (
        <div
            onClick={handleClick}
            className="flex justify-between cursor-pointer border rounded-xl shadow-md p-4 mb-4 hover:bg-gray-100 transition-all"
        >
            <h3 className="text-lg font-semibold line-clamp-2">{board.title}</h3>
            <button
                onClick={handleDeleteClick}
                className="ml-4 px-2 py-1 bg-red-500 text-white rounded"
            >
                Delete
            </button>
        </div>
    );
}