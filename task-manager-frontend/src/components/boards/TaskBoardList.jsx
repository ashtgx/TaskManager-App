import BoardCard from "./BoardCard";
import { deleteTaskBoard } from "../../api/boards";

export default function TaskBoardList({ projectID, boards, onReload }) {
    const handleDeleteBoard = async (boardID) => {
        try {
            await deleteTaskBoard(projectID, boardID);
            onReload();
        } catch (err) {
            console.error("Failed to delete board", err);
            alert("Error deleting board");
        }
    };

    return (
        <div className="mb-6">
            <h2 className="text-xl font-bold mb-2">Task Boards</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {boards.map((board) => (
                    <BoardCard
                        key={board.id}
                        board={board}
                        link={`/projects/${projectID}/task-boards/${board.id}`}
                        onDelete={handleDeleteBoard}
                    />
                ))}
            </div>
        </div>
    );
}