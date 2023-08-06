import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { DragDropContext } from "react-beautiful-dnd";
import Column from "./Column";

// ipcrenderer
const { ipcRenderer } = require("electron");

const Board = (props: any) => {
  // destructuring props
  const { board, onBoardUpdate } = props;

  // Use the useParams hook to get the board ID from the URL
  const { boardId } = useParams();

  // hooks
  // const [columns, setColumns] = useState([] as any);
  // const [columns, setColumns] = useState(board.columns || ([] as any));
  const [columns, setColumns] = useState([] as any);
  const [newColumnName, setNewColumnName] = useState("");

  // Use local state to store the board data if available, otherwise use the prop
  const [currentBoard, setCurrentBoard] = useState(board || null);

  console.log("this is current board", currentBoard);

  useEffect(() => {
    // Load board data from the store if not available in the prop
    const loadBoard = async () => {
      try {
        // Ensure boardId is available before loading
        if (!currentBoard && boardId) {
          const storedBoard = await ipcRenderer.invoke("load_board", boardId);
          console.log("this is stored board", storedBoard);
          setCurrentBoard(storedBoard);
          setColumns(storedBoard.columns || []);
        }
      } catch (err) {
        console.error("Error loading board:", err);
      }
    };

    loadBoard();
  }, [boardId, currentBoard]);

  // useEffect(() => {
  //   setColumns(board.columns || []);
  // }, [board.columns]);

  useEffect(() => {
    // Check if board exists before setting the columns
    if (board && board.columns) {
      setColumns(board.columns || []);
    }
  }, [board]);

  // save columns to board
  const handleColumnUpdate = async (updatedColumns: any) => {
    // Create a new board object with the updated columns array
    // const updatedBoards = {
    //   ...board,
    //   columns: updatedColumns,
    // };

    if (!currentBoard) {
      return;
    }

    const updatedBoards = {
      ...currentBoard,
      columns: updatedColumns,
    };

    // Call the parent function to update the board in the BoardManager
    // onBoardUpdate(updatedBoards);

    await saveBoardToDb(updatedBoards);

    setColumns(updatedColumns);
    setCurrentBoard(updatedBoards);
  };

  // add columns
  const handleAddColumn = () => {
    if (newColumnName.trim() === "") {
      return;
    }

    const newColumn = {
      id: `column-${Date.now()}`,
      title: newColumnName,
      tasks: [],
    };

    // setColumns((prevColumns: any) => [...prevColumns, newColumn]);

    const updatedColumns = [...columns, newColumn];
    setColumns(updatedColumns);

    setNewColumnName("");

    // updateBoardWithColumns(updatedColumns);
    handleColumnUpdate(updatedColumns);
  };

  // add tasks
  // const handleAddTask = (columnId: any, task: any) => {
  //   // setColumns((prevColumns: any) =>
  //   //   prevColumns.map((column: any) => {
  //   //     if (column.id === columnId) {
  //   //       return {
  //   //         ...column,
  //   //         tasks: [...column.tasks, task],
  //   //       };
  //   //     }
  //   //     return column;
  //   //   })
  //   // );

  //   const updatedColumns = columns.map((column: any) => {
  //     if (column.id === columnId) {
  //       return {
  //         ...column,
  //         tasks: [...column.tasks, task],
  //       };
  //     }
  //     return column;
  //   });

  //   setColumns(updatedColumns);
  //   updateBoardWithColumns(updatedColumns);
  // };

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

  // dragging tasks
  // const handleDragTasks = (result: any) => {
  //   const { source, destination } = result;

  //   if (!destination) {
  //     return;
  //   }

  //   if (
  //     source.droppableId === destination.droppableId &&
  //     source.index === destination.index
  //   ) {
  //     return;
  //   }

  //   const sourceColumnId = source.droppableId;
  //   const destinationColumnId = destination.droppableId;
  //   const taskIndex = source.index;

  //   setColumns((prevColumns: any) => {
  //     const updatedColumns = [...prevColumns];

  //     const sourceColumnIndex = updatedColumns.findIndex(
  //       (column: any) => column.id === sourceColumnId
  //     );

  //     const destinationColumnIndex = updatedColumns.findIndex(
  //       (column) => column.id === destinationColumnId
  //     );

  //     const task: any = updatedColumns[sourceColumnIndex].tasks.splice(
  //       taskIndex,
  //       1
  //     )[0];

  //     updatedColumns[destinationColumnIndex].tasks.splice(
  //       destination.index,
  //       0,
  //       task
  //     );

  //     return updatedColumns;
  //   });
  // };

  // const handleDragTasks = (result: any) => {
  //   const { source, destination } = result;

  //   if (!destination) {
  //     return;
  //   }

  //   if (
  //     source.droppableId === destination.droppableId &&
  //     source.index === destination.index
  //   ) {
  //     return;
  //   }

  //   const sourceColumnId = source.droppableId;
  //   const destinationColumnId = destination.droppableId;
  //   const taskIndex = source.index;

  //   // setColumns((prevColumns: any) => {
  //   //   const updatedColumns = [...prevColumns];

  //   //   const sourceColumnIndex = updatedColumns.findIndex(
  //   //     (column: any) => column.id === sourceColumnId
  //   //   );

  //   //   const destinationColumnIndex = updatedColumns.findIndex(
  //   //     (column) => column.id === destinationColumnId
  //   //   );

  //   //   const task: any = updatedColumns[sourceColumnIndex].tasks.splice(
  //   //     taskIndex,
  //   //     1
  //   //   )[0];

  //   //   updatedColumns[destinationColumnIndex].tasks.splice(
  //   //     destination.index,
  //   //     0,
  //   //     task
  //   //   );

  //   //   return updatedColumns;
  //   // });

  //   const destinationIndex = destination.index;

  //   const updatedColumns = columns.map((column: any) => {
  //     if (column.id === sourceColumnId) {
  //       const copiedTasks = [...column.tasks];
  //       const [movedTask] = copiedTasks.splice(taskIndex, 1);
  //       copiedTasks.splice(destinationIndex, 0, movedTask);

  //       return {
  //         ...column,
  //         tasks: copiedTasks,
  //       };
  //     } else if (column.id === destinationColumnId) {
  //       return {
  //         ...column,
  //         tasks: [...column.tasks],
  //       };
  //     }

  //     return column;
  //   });

  //   setColumns(updatedColumns);
  //   updateBoardWithColumns(updatedColumns);
  // };

  const handleDragTasks = (result: any) => {
    const { source, destination } = result;

    if (!destination) {
      return;
    }

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const sourceColumnId = source.droppableId;
    const destinationColumnId = destination.droppableId;
    const taskIndex = source.index;

    // setColumns((prevColumns: any) => {
    //   const updatedColumns = [...prevColumns];

    //   const sourceColumnIndex = updatedColumns.findIndex(
    //     (column: any) => column.id === sourceColumnId
    //   );

    //   const destinationColumnIndex = updatedColumns.findIndex(
    //     (column) => column.id === destinationColumnId
    //   );

    //   const task: any = updatedColumns[sourceColumnIndex].tasks.splice(
    //     taskIndex,
    //     1
    //   )[0];

    //   updatedColumns[destinationColumnIndex].tasks.splice(
    //     destination.index,
    //     0,
    //     task
    //   );

    //   return updatedColumns;
    // });

    const destinationIndex = destination.index;

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

    // setColumns(updatedColumns);
    // updateBoardWithColumns(updatedColumns);
  };

  const saveBoardToDb = async (board: any) => {
    try {
      await ipcRenderer.invoke("save_board", board);
    } catch (err) {
      console.error("Error saving boards:", err);
    }
  };

  const updateBoardWithColumns = async (updatedColumns: any) => {
    if (!currentBoard) {
      return;
    }

    const updatedBoard = { ...currentBoard, columns: updatedColumns };
    await saveBoardToDb(updatedBoard);
    // onBoardUpdate(updatedBoard);
    setCurrentBoard(updatedBoard);
  };

  return (
    <DragDropContext onDragEnd={handleDragTasks}>
      <div className="board">
        {columns.map((column: any) => (
          <Column
            key={column.id}
            column={column}
            onAddTask={handleAddTask}
            onColumnUpdate={(updatedTasks: any) =>
              handleAddTask(column.id, updatedTasks)
            }
          />
        ))}

        <div className="add-column">
          <input
            type="text"
            value={newColumnName}
            placeholder="Enter Column Name"
            onChange={(e) => setNewColumnName(e.target.value)}
          />

          <button onClick={handleAddColumn}>Add Column</button>
        </div>

        {/* using link for redirecting to boards */}
        <Link to="/">Back</Link>
      </div>
    </DragDropContext>
  );
};

export default Board;
