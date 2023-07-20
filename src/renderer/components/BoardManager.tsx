import { useState } from "react";
import Board from "./Board";

const BoardManager = () => {
  const [boards, setBoards] = useState([] as any);
  const [newBoardName, setNewBoardName] = useState("");

  // add boards
  const handleAddBoard = () => {
    if (newBoardName.trim() === "") {
      return;
    }

    const newBoard = {
      id: `board-${Date.now()}`,
      name: newBoardName,
    };

    setBoards((prevBoards: any) => [...prevBoards, newBoard]);
    setNewBoardName("");
  };

  // delete boards
  const handleDeleteBoard = (boardId: string) => {
    setBoards((prevBoards: any) =>
      prevBoards.filter((board: any) => board.id !== boardId)
    );
  };

  return (
    <div className="board-manager">
      <div className="add-board">
        <input
          type="text"
          value={newBoardName}
          placeholder="Enter Board Name"
          onChange={(e) => setNewBoardName(e.target.value)}
        />

        <button onClick={handleAddBoard}>Add Board</button>
      </div>

      <div className="boards">
        {boards.map((board: any) => (
          <div key={board.id} className="board-wrapper">
            <h2>{board.name}</h2>
            <button onClick={() => handleDeleteBoard(board.id)}>
              Delete Board
            </button>

            <Board />
          </div>
        ))}
      </div>
    </div>
  );
};

export default BoardManager;
