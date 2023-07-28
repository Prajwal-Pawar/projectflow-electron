import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { DragDropContext } from "react-beautiful-dnd";
import Column from "./Column";

// ipcrenderer
const { ipcRenderer } = require("electron");

const Board = (props: any) => {
  // destructuring props
  const { board, onBoardUpdate } = props;

  // hooks
  // const [columns, setColumns] = useState([] as any);
  // const [columns, setColumns] = useState(board.columns || ([] as any));
  const [columns, setColumns] = useState([] as any);
  const [newColumnName, setNewColumnName] = useState("");

  useEffect(() => {
    setColumns(board.columns || []);
  }, [board.columns]);

  // save columns to board
  const handleColumnUpdate = async (updatedColumns: any) => {
    // Create a new board object with the updated columns array
    const updatedBoards = {
      ...board,
      columns: updatedColumns,
    };

    // Call the parent function to update the board in the BoardManager
    onBoardUpdate(updatedBoards);
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
  const handleAddTask = (columnId: any, task: any) => {
    // setColumns((prevColumns: any) =>
    //   prevColumns.map((column: any) => {
    //     if (column.id === columnId) {
    //       return {
    //         ...column,
    //         tasks: [...column.tasks, task],
    //       };
    //     }
    //     return column;
    //   })
    // );

    const updatedColumns = columns.map((column: any) => {
      if (column.id === columnId) {
        return {
          ...column,
          tasks: [...column.tasks, task],
        };
      }
      return column;
    });

    setColumns(updatedColumns);
    updateBoardWithColumns(updatedColumns);
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

    const updatedColumns = columns.map((column: any) => {
      if (column.id === sourceColumnId) {
        const copiedTasks = [...column.tasks];
        const [movedTask] = copiedTasks.splice(taskIndex, 1);
        copiedTasks.splice(destinationIndex, 0, movedTask);

        return {
          ...column,
          tasks: copiedTasks,
        };
      } else if (column.id === destinationColumnId) {
        return {
          ...column,
          tasks: [...column.tasks],
        };
      }

      return column;
    });

    setColumns(updatedColumns);
    updateBoardWithColumns(updatedColumns);
  };

  const saveBoardsToDb = async (updatedBoards: any) => {
    try {
      await ipcRenderer.invoke("save_boards", updatedBoards);
    } catch (err) {
      console.error("Error saving boards:", err);
    }
  };

  const updateBoardWithColumns = async (updatedColumns: any) => {
    const updatedBoard = { ...board, columns: updatedColumns };
    await saveBoardsToDb(updatedBoard);
    onBoardUpdate(updatedBoard);
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
