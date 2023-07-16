import Column from "./Column";

const Board = () => {
  const columnData = [
    { id: "column-1", title: "To Do", taskIds: ["task-1", "task-2", "task-3"] },
    { id: "column-2", title: "In Progress", taskIds: ["task-4", "task-5"] },
    { id: "column-3", title: "Done", taskIds: ["task-6"] },
    { id: "column-4", title: "Bugs", taskIds: ["task-6", "task-2"] },
  ];

  const taskData = {
    "task-1": { id: "task-1", content: "Task 1" },
    "task-2": { id: "task-2", content: "Task 2" },
    "task-3": { id: "task-3", content: "Task 3" },
    "task-4": { id: "task-4", content: "Task 4" },
    "task-5": { id: "task-5", content: "Task 5" },
    "task-6": { id: "task-6", content: "Task 6" },
  };

  return (
    <div className="board">
      {columnData.map((column: any) => (
        <Column
          key={column.id}
          column={column}
          tasks={column.taskIds.map((taskId: keyof object) => taskData[taskId])}
        />
      ))}
    </div>
  );
};

export default Board;
