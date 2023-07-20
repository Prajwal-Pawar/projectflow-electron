import { DragDropContext } from "react-beautiful-dnd";
import { Routes, Route } from "react-router-dom";
import "../styles/App.css";
import Board from "./Board";
import BoardManager from "./BoardManager";

function App() {
  const handleDragEnd = () => {};

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      {/* using routes */}
      <Routes>
        <Route path="/" element={<BoardManager />} />
        <Route path="/board/:boardId" element={<Board />} />
      </Routes>

      {/* <Board /> */}
      {/* <BoardManager /> */}
    </DragDropContext>
  );
}

export default App;
