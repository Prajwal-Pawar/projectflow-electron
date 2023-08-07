import { useEffect, useState } from "react";
import { Droppable } from "react-beautiful-dnd";
import Task from "./Task";

// IpcRenderer to communicate from Renderer process to Main process
const { ipcRenderer } = require("electron");

const Column = (props: any) => {
  // destructuring props
  const { column, onAddTask, onColumnUpdate, onDeleteColumn } = props;

  // hooks
  const [newTaskName, setNewTaskName] = useState("");
  const [tasks, setTasks] = useState(column.tasks || ([] as any));

  useEffect(() => {
    // Function to load tasks for the specific column from electron-store/data.json
    const loadTasks = async () => {
      try {
        if (column.id) {
          // load_tasks call to IpcMain process
          const storedTasks = await ipcRenderer.invoke("load_tasks", column.id);
          // Update the state of tasks with the tasks stored in data.json
          setTasks(storedTasks);
        }
      } catch (err) {
        console.error("Error loading tasks:", err);
      }
    };

    loadTasks();
  }, [column.id, tasks]);

  // Function for saving tasks to electron-store/data.json
  const saveTasksToDb = async (columnId: any, updatedTasks: any) => {
    try {
      // save_tasks call to IpcMain process
      await ipcRenderer.invoke("save_tasks", columnId, updatedTasks);
    } catch (err) {
      console.error("Error saving Tasks:", err);
    }
  };

  // Function to add new tasks
  const handleAddTask = async () => {
    // If input is empty, return
    if (newTaskName.trim() === "") {
      return;
    }

    const newTask = {
      id: `task-${Date.now()}`,
      name: newTaskName,
    };

    onAddTask(column.id, newTask);

    // updated tasks is all the existing tasks and newly added task
    const updatedTasks = [...tasks, newTask];

    // Update the state of tasks with the updated tasks
    setTasks(updatedTasks);
    // Save the updated tasks to data.json
    saveTasksToDb(column.id, updatedTasks);

    setNewTaskName("");
  };

  // Function to handle the deletion of a task
  const handleDeleteTask = async (taskId: string) => {
    // Find the index of the task with the given taskId in the current column
    const taskIndex = tasks.findIndex((task: any) => task.id === taskId);

    if (taskIndex !== -1) {
      // Create a copy of the tasks array
      const updatedTasks = [...tasks];

      // Remove the task with the given taskId from the updatedTasks array
      updatedTasks.splice(taskIndex, 1);

      // Update the state with the updated tasks
      setTasks(updatedTasks);
      // Save the updated tasks to data.json
      saveTasksToDb(column.id, updatedTasks);
    }
  };

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
              <Task
                key={task.id}
                task={task}
                index={index}
                onDeleteTask={handleDeleteTask}
              />
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

      <button onClick={() => onDeleteColumn(column.id)}>Delete Column</button>
    </div>
  );
};

export default Column;
