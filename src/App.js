// App.js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./screens/Home";
import ExcelReaderScreen from "./screens/excel";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/excel" element={<ExcelReaderScreen />} />
      </Routes>
    </Router>
  );
}

export default App;
