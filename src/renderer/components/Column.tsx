import { useEffect, useState } from "react";
import { Droppable } from "react-beautiful-dnd";
import Task from "./Task";

// ipcrenderer
const { ipcRenderer } = require("electron");

const Column = (props: any) => {
  // destructuring props
  // const { column, tasks } = props;
  const { column, onAddTask, onColumnUpdate } = props;

  // hooks
  const [newTaskName, setNewTaskName] = useState("");
  const [tasks, setTasks] = useState([] as any);

  // useEffect(() => {
  //   // Function to load tasks for the column from electron-store
  //   const loadTasks = async () => {
  //     try {
  //       const storedTasks = await ipcRenderer.invoke("load_tasks", column.id);
  //       setTasks(storedTasks);
  //     } catch (err) {
  //       console.error("Error loading tasks:", err);
  //     }
  //   };

  //   loadTasks();
  // }, [column.id]);

  // add tasks
  const handleAddTask = async () => {
    if (newTaskName.trim() === "") {
      return;
    }

    const newTask = {
      id: `task-${Date.now()}`,
      name: newTaskName,
    };

    onAddTask(column.id, newTask);
    // setTasks((prevTasks: any) => [...prevTasks, newTask]);

    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);

    console.log("this is updated tasks", updatedTasks);

    await ipcRenderer.invoke("save_tasks", column.id, updatedTasks);

    setNewTaskName("");
  };

  useEffect(() => {
    // Call the parent function to update the board with the updated column
    onColumnUpdate(tasks);
  }, [tasks]);

  // const handleTaskInputChange = (e: any) => {
  //   setNewTaskName(e.target.value);
  // };

  return (
    <div className="column">
      <h3>{column.title}</h3>
      <Droppable droppableId={column.id}>
        {(provided) => (
          <div
            className="task-list"
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            {tasks.map((task: any, index: any) => (
              <Task key={task.id} task={task} index={index} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      <div className="add-task">
        <input
          type="text"
          value={newTaskName}
          placeholder="Enter Task"
          onChange={(e: any) => setNewTaskName(e.target.value)}
          // onChange={handleTaskInputChange}
        />

        <button onClick={handleAddTask}>Add Task</button>
      </div>
    </div>
  );
};

export default Column;
