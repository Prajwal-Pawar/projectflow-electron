import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { DragDropContext } from "react-beautiful-dnd";
import Column from "./Column";

// IpcRenderer to communicate from Renderer process to Main process
const { ipcRenderer } = require("electron");

const Board = (props: any) => {
  // destructuring props
  const { board, onBoardUpdate } = props;

  // Use the useParams hook to get the board ID from the URL
  const { boardId } = useParams();

  // hooks
  const [columns, setColumns] = useState([] as any);
  const [newColumnName, setNewColumnName] = useState("");
  // Use local state to store the board data if available, otherwise use the prop
  const [currentBoard, setCurrentBoard] = useState(board || null);

  useEffect(() => {
    // Function to load board data from data.json if not available in the prop
    const loadBoard = async () => {
      try {
        // Ensure boardId is available before loading
        if (!currentBoard && boardId) {
          // load_board call to IpcMain process
          const storedBoard = await ipcRenderer.invoke("load_board", boardId);
          // Update the state of board with the board stored in data.json
          setCurrentBoard(storedBoard);
          // Update the state with the columns stored in data.json
          setColumns(storedBoard.columns || []);
        }
      } catch (err) {
        console.error("Error loading board:", err);
      }
    };

    loadBoard();
  }, [boardId, currentBoard]);

  useEffect(() => {
    // Check if board exists before setting the columns
    if (board && board.columns) {
      setColumns(board.columns || []);
    }
  }, [board]);

  // Function to save columns to board
  const handleColumnUpdate = async (updatedColumns: any) => {
    if (!currentBoard) {
      return;
    }

    // updated board is current board data and newly added column data
    const updatedBoards = {
      ...currentBoard,
      columns: updatedColumns,
    };

    await saveBoardToDb(updatedBoards);

    // Update the state with the updated columns
    setColumns(updatedColumns);
    setCurrentBoard(updatedBoards);
  };

  // Function to add new columns
  const handleAddColumn = () => {
    // If input is empty, return
    if (newColumnName.trim() === "") {
      return;
    }

    const newColumn = {
      id: `column-${Date.now()}`,
      title: newColumnName,
      tasks: [],
    };

    // updated column is all the existing columns and newly added column
    const updatedColumns = [...columns, newColumn];

    // Update the state with the updated columns
    setColumns(updatedColumns);
    handleColumnUpdate(updatedColumns);

    // clear the input
    setNewColumnName("");
  };

  // Function to add new tasks
  const handleAddTask = (columnId: any, task: any) => {
    // Find the column with the matching columnId
    const column = columns.find((column: any) => column.id === columnId);

    if (column) {
      // Create a new array with the existing tasks and the new task
      const updatedTasks = [...column.tasks, task];

      // Create a new column object with the updated tasks array
      const updatedColumn = {
        ...column,
        tasks: updatedTasks,
      };

      // Create a new array with the updated column and the rest of the columns
      const updatedColumns = columns.map((column: any) =>
        column.id === columnId ? updatedColumn : column
      );

      // Update the state with the updated columns
      setColumns(updatedColumns);

      // Call the function to update the board with the updated columns
      updateBoardWithColumns(updatedColumns);
    }
  };

  // Function for handling dragging of tasks
  const handleDragTasks = (result: any) => {
    const { source, destination } = result;

    if (!destination) {
      return;
    }

    // If dragged tasks source column and destination column is same, return
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const sourceColumnId = source.droppableId;
    const destinationColumnId = destination.droppableId;
    const taskIndex = source.index;
    const destinationIndex = destination.index;

    // Update the state with the updated columns
    setColumns((prevColumns: any) => {
      const updatedColumns = [...prevColumns];

      const sourceColumnIndex = updatedColumns.findIndex(
        (column: any) => column.id === sourceColumnId
      );

      const destinationColumnIndex = updatedColumns.findIndex(
        (column) => column.id === destinationColumnId
      );

      const task: any = updatedColumns[sourceColumnIndex].tasks.splice(
        taskIndex,
        1
      )[0];

      updatedColumns[destinationColumnIndex].tasks.splice(
        destinationIndex,
        0,
        task
      );

      // Update the state with the updated columns
      setColumns(updatedColumns);

      // Save the updated columns to the database
      updateBoardWithColumns(updatedColumns);

      return updatedColumns;
    });
  };

  // Function for saving specific board to electron-store/data.json
  const saveBoardToDb = async (board: any) => {
    try {
      await ipcRenderer.invoke("save_board", board);
    } catch (err) {
      console.error("Error saving boards:", err);
    }
  };

  // Function to save the updated columns to the database
  const updateBoardWithColumns = async (updatedColumns: any) => {
    if (!currentBoard) {
      return;
    }

    const updatedBoard = { ...currentBoard, columns: updatedColumns };

    await saveBoardToDb(updatedBoard);
    // Update the state of board with the updated board
    setCurrentBoard(updatedBoard);
  };

  // Function to handle the deletion of a column
  const handleDeleteColumn = async (columnId: string) => {
    // Find the index of the column with the given columnId
    const columnIndex = columns.findIndex(
      (column: any) => column.id === columnId
    );

    if (columnIndex !== -1) {
      // Create a copy of the columns array
      const updatedColumns = [...columns];

      // Remove the column with the given column index from the updatedColumns array
      updatedColumns.splice(columnIndex, 1);

      // Update the state with the updated columns
      setColumns(updatedColumns);
      // Save the updated columns to the database
      updateBoardWithColumns(updatedColumns);
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragTasks}>
      {/* rendering boards name */}
      <h1>{currentBoard ? currentBoard.name : null}</h1>

      <div className="board">
        {/* render all columns */}
        {columns.map((column: any) => (
          <Column
            key={column.id}
            column={column}
            onAddTask={handleAddTask}
            onColumnUpdate={(updatedTasks: any) =>
              handleAddTask(column.id, updatedTasks)
            }
            onDeleteColumn={handleDeleteColumn}
          />
        ))}

        <div className="add-column">
          <input
            type="text"
            value={newColumnName}
            placeholder="Enter Column Name"
            onChange={(e) => setNewColumnName(e.target.value)}
          />

          {/* Button to add new columns */}
          <button onClick={handleAddColumn}>Add Column</button>
        </div>

        {/* using link for redirecting to all boards */}
        <Link to="/">Back</Link>
      </div>
    </DragDropContext>
  );
};

export default Board;
