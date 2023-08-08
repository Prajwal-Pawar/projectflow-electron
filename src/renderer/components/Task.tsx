import { Draggable } from "react-beautiful-dnd";
import "../styles/task.css";

const Task = (props: any) => {
  // destructuring props
  const { task, index, onDeleteTask } = props;

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided) => (
        <div
          className="task"
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
        >
          <h3>{task.name}</h3>

          <button onClick={() => onDeleteTask(task.id)}>Delete Tasks</button>
        </div>
      )}
    </Draggable>
  );
};

export default Task;
