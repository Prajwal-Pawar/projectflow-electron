import { DragDropContext } from "react-beautiful-dnd";
import "../styles/App.css";
import Board from "./Board";

function App() {
  const handleDragEnd = () => {};

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Board />
    </DragDropContext>
  );
}

export default App;
