import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Board from "./Board";

// IpcRenderer to communicate from Renderer process to Main process
const { ipcRenderer } = require("electron");

const BoardManager = () => {
  const [boards, setBoards] = useState([] as any);
  const [newBoardName, setNewBoardName] = useState("");
  // State to store the selected board ID
  // Managing a state for when i click on board link board id gets lost
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);

  // for redirecting
  const navigate = useNavigate();

  useEffect(() => {
    // Function to load boards from electron-store/data.json
    const loadBoards = async () => {
      try {
        // load_boards call to IpcMain process
        const storedBoards = await ipcRenderer.invoke("load_boards");
        // Update the state of boards with the boards stored in data.json
        setBoards(storedBoards);
      } catch (err) {
        console.error("Error loading boards:", err);
      }
    };

    loadBoards();
  }, []);

  // Function for saving boards to electron-store/data.json
  const saveBoardsToDb = async (updatedBoards: any) => {
    try {
      // save_boards call to IpcMain process
      await ipcRenderer.invoke("save_boards", updatedBoards);
    } catch (err) {
      console.error("Error saving boards:", err);
    }
  };

  // Function to add new boards
  const handleAddBoard = async () => {
    // If input is empty, return
    if (newBoardName.trim() === "") {
      return;
    }

    const newBoard = {
      id: `board-${Date.now()}`,
      name: newBoardName,
      columns: [],
    };

    // updated board is all the existing board and newly added board
    const updatedBoards = [...boards, newBoard];

    // Update the state of boards with the updated board
    setBoards(updatedBoards);
    saveBoardsToDb(updatedBoards);

    // clear the input
    setNewBoardName("");
  };

  // Function to update the board with updated columns
  const handleBoardUpdate = (updatedBoard: any) => {
    // Gets updated board if board id matches with updated boards id
    const updatedBoards = boards.map((board: any) =>
      board.id === updatedBoard.id ? updatedBoard : board
    );

    // Update the state of boards with the updated board
    setBoards(updatedBoards);
    saveBoardsToDb(updatedBoards);
  };

  // Function to delete board
  const handleDeleteBoard = async (boardId: string) => {
    const updatedBoards = boards.filter((board: any) => board.id !== boardId);

    // Update the state of boards with the updated board
    setBoards(updatedBoards);
    saveBoardsToDb(updatedBoards);
  };

  // Function to handle board name click and redirect to the specific board
  // With boardId redirect user to the specific board
  const handleBoardClick = (boardId: any) => {
    setSelectedBoardId(boardId);
    navigate(`/board/${boardId}`);
  };

  return (
    <div className="board-manager">
      {/* welcome message and boards count */}
      <h2>Welcome Back!</h2>
      <h3>You have {boards.length} active boards</h3>

      <div className="add-board">
        <input
          type="text"
          value={newBoardName}
          placeholder="Enter Board Name"
          onChange={(e) => setNewBoardName(e.target.value)}
        />

        {/* Add new board button */}
        <button onClick={handleAddBoard}>Add Board</button>
      </div>

      <div className="boards">
        {boards.map((board: any) => (
          <div key={board.id} className="board-wrapper">
            {/* Use the Link component to create a link to the board */}
            <Link
              to={`/board/${board.id}`}
              onClick={() => handleBoardClick(board.id)}
            >
              <h2>{board.name}</h2>
            </Link>

            {/* Delete board button */}
            <button onClick={() => handleDeleteBoard(board.id)}>
              Delete Board
            </button>
          </div>
        ))}
      </div>

      <div>
        <Link to={"/about"}>About</Link>
      </div>

      {/* this way boards id doesnt get lost when we redirect to board */}
      {/* conditional rendering */}
      {/* Render the Board component only if a board is selected */}
      {selectedBoardId && (
        <Board
          key={selectedBoardId}
          board={boards.find((board: any) => board.id === selectedBoardId)}
          onBoardUpdate={handleBoardUpdate}
        />
      )}
    </div>
  );
};

export default BoardManager;
