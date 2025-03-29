import BoardCard from "./BoardCard";
import { deleteKanbanBoard } from "../../api/boards";

export default function KanbanBoardList({ projectID, boards, onReload }) {
    const handleDeleteBoard = async (boardID) => {
            try {
                await deleteKanbanBoard(projectID, boardID);
                onReload();
            } catch (err) {
                console.error("Failed to delete board", err);
                alert("Error deleting board");
            }
        };
    return (
        <div className="mb-6">
            <h2 className="text-xl font-bold mb-2">Kanban Boards</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {boards.map((board) => (
                    <BoardCard
                        key={board.id}
                        board={board}
                        link={`/projects/${projectID}/kanban-boards/${board.id}`}
                        onDelete={handleDeleteBoard}
                    />
                ))}
            </div>
        </div>
    );
}