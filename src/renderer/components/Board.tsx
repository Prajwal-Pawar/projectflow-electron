import { useState } from "react";
import { DragDropContext } from "react-beautiful-dnd";
import Column from "./Column";

const Board = () => {
  // hooks
  const [columns, setColumns] = useState([] as any);
  const [newColumnName, setNewColumnName] = useState("");

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

    setColumns((prevColumns: any) => [...prevColumns, newColumn]);
    setNewColumnName("");
  };

  // add tasks
  const handleAddTask = (columnId: any, task: any) => {
    setColumns((prevColumns: any) =>
      prevColumns.map((column: any) => {
        if (column.id === columnId) {
          return {
            ...column,
            tasks: [...column.tasks, task],
          };
        }
        return column;
      })
    );
  };

  // dragging tasks
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
        destination.index,
        0,
        task
      );

      return updatedColumns;
    });
  };

  return (
    <DragDropContext onDragEnd={handleDragTasks}>
      <div className="board">
        {columns.map((column: any) => (
          <Column key={column.id} column={column} onAddTask={handleAddTask} />
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
      </div>
    </DragDropContext>
  );
};

export default Board;
