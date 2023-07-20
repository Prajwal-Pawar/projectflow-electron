import { DragDropContext } from "react-beautiful-dnd";
import "../styles/App.css";
import Board from "./Board";
import BoardManager from "./BoardManager";

function App() {
  const handleDragEnd = () => {};

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      {/* <Board /> */}
      <BoardManager />
    </DragDropContext>
  );
}

export default App;
