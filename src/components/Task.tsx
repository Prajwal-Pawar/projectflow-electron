import { Draggable } from "react-beautiful-dnd";

const Task = (props: any) => {
  // destructuring props
  const { task, index } = props;

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided) => (
        <div
          className="task"
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
        >
          {task.content}
        </div>
      )}
    </Draggable>
  );
};

export default Task;
