import { Routes, Route } from "react-router-dom";
import "../styles/App.css";
import BoardManager from "./BoardManager";
import Board from "./Board";
import About from "./About";

function App() {
  return (
    <div>
      {/* using routes to enable routing */}
      <Routes>
        <Route path="/" element={<BoardManager />} />
        <Route path="/board/:boardId" element={<Board />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </div>
  );
}

export default App;
