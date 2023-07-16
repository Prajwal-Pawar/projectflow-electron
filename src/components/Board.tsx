import { useState } from "react";
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

  return (
    <div className="board">
      {columns.map((column: any) => (
        <Column
          key={column.id}
          column={column}
          // onAddTask={(task: any) => handleAddTask(column.id, task)}
          onAddTask={handleAddTask}
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
    </div>
  );
};

export default Board;
