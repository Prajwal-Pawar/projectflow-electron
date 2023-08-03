import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Board from "./Board";

// ipcrenderer
const { ipcRenderer } = require("electron");

const BoardManager = () => {
  const [boards, setBoards] = useState([] as any);
  const [newBoardName, setNewBoardName] = useState("");
  // managing a state for when i click on board link board id gets lost
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null); // State to store the selected board ID

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

    saveBoardsToDb(updatedBoards);

    setNewBoardName("");

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

  // // delete boards
  // const handleDeleteBoard = (boardId: string) => {
  //   setBoards((prevBoards: any) =>
  //     prevBoards.filter((board: any) => board.id !== boardId)
  //   );
  // };

  // Function to handle board name click and redirect to the board
  const handleBoardClick = (boardId: any) => {
    setSelectedBoardId(boardId);
    navigate(`/board/${boardId}`);
  };

  // const handleBoardClick = (boardId: any) => {
  //   setSelectedBoardId(boardId);
  // };

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
            {/* Use the Link component to create a link to the board */}
            <Link
              to={`/board/${board.id}`}
              onClick={() => handleBoardClick(board.id)}
            >
              <h2>{board.name}</h2>
            </Link>
            {/* <button onClick={() => handleDeleteBoard(board.id)}>
              Delete Board
            </button> */}

            {/* board id gets lost when we click on board link or redirect to link */}
            {/* <Board
              key={board.id}
              board={board}
              onBoardUpdate={handleBoardUpdate}
            /> */}
          </div>
        ))}
      </div>

      {/* this way boards id doesnt get lost when we redirect to board */}
      {/* conditional rendering */}
      {/* Render the Board component only if a board is selected */}
      {selectedBoardId && (
        <Board
          key={selectedBoardId}
          // board={boards.find((board: any) => board.id === selectedBoardId)}
          board={boards.find((board: any) => board.id === selectedBoardId)}
          onBoardUpdate={handleBoardUpdate}
        />
      )}
    </div>
  );
};

export default BoardManager;
