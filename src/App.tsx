import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import CharacterSelectPage from "./pages/CharacterSelectPage";
import BattleWrapper from "./pages/BattleWrapper";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/select" element={<CharacterSelectPage />} />
      <Route path="/battle" element={<BattleWrapper />} />
    </Routes>
  );
}

export default App;