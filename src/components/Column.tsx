import { useEffect, useState } from "react";
import { Droppable } from "react-beautiful-dnd";
import Task from "./Task";

const Column = (props: any) => {
  // destructuring props
  // const { column, tasks } = props;
  const { column, onAddTask } = props;

  // hooks
  const [newTaskName, setNewTaskName] = useState("");
  const [tasks, setTasks] = useState([] as any);

  useEffect(() => {
    setTasks(column.tasks);
  }, [column.tasks]);

  // add tasks
  const handleAddTask = () => {
    if (newTaskName.trim() === "") {
      return;
    }

    const newTask = {
      id: `task-${Date.now()}`,
      name: newTaskName,
    };

    onAddTask(column.id, newTask);
    setTasks((prevTasks: any) => [...prevTasks, newTask]);

    setNewTaskName("");
  };

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
