import { Draggable } from "react-beautiful-dnd";

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
          {task.name}

          <button onClick={() => onDeleteTask(task.id)}>Delete Tasks</button>
        </div>
      )}
    </Draggable>
  );
};

export default Task;
