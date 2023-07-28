import { useState, useEffect } from "react";
import { json, useNavigate } from "react-router-dom";
import Board from "./Board";

// ipcrenderer
const { ipcRenderer } = require("electron");

const BoardManager = () => {
  const [boards, setBoards] = useState([] as any);
  const [newBoardName, setNewBoardName] = useState("");

  // for redirecting
  const navigate = useNavigate();

  useEffect(() => {
    // Function to load boards from electron-store
    const loadBoards = async () => {
      try {
        const storedBoards = await ipcRenderer.invoke("load_boards");
        setBoards(storedBoards);
      } catch (err) {
        console.error("Error loading boards:", err);
      }
    };

    loadBoards();
  }, []);

  const saveBoardsToDb = async (updatedBoards: any) => {
    try {
      await ipcRenderer.invoke("save_boards", updatedBoards);
    } catch (err) {
      console.error("Error saving boards:", err);
    }
  };

  // add boards
  const handleAddBoard = async () => {
    if (newBoardName.trim() === "") {
      return;
    }

    const newBoard = {
      id: `board-${Date.now()}`,
      name: newBoardName,
      columns: [],
    };

    // setBoards((prevBoards: any) => [...prevBoards, newBoard]);

    const updatedBoards = [...boards, newBoard];
    setBoards(updatedBoards);

    setNewBoardName("");

    saveBoardsToDb(updatedBoards);

    // redirecting to the board
    // navigate(`/board/${newBoard.id}`);
  };

  // Function to update the board with updated columns
  const handleBoardUpdate = (updatedBoard: any) => {
    const updatedBoards = boards.map((board: any) =>
      board.id === updatedBoard.id ? updatedBoard : board
    );

    setBoards(updatedBoards);
    saveBoardsToDb(updatedBoards);
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

            <Board
              key={board.id}
              board={board}
              onBoardUpdate={handleBoardUpdate}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default BoardManager;
