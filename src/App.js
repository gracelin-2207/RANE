// App.js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./screens/Home";
import ExcelReaderScreen from "./screens/excel";
import LandingPage from "./screens/Landing";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<Home />} />
        <Route path="/excel" element={<ExcelReaderScreen />} />
      </Routes>
    </Router>
  );
}

export default App;
