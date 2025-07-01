// App.js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./screens/Home";
import ExcelReaderScreen from "./screens/excel";
import LandingPage from "./screens/Landing";
import PrivateRoute from "./screens/PrivateRoute";

function App() {
  return (
    <Router>
      <Routes>
      <Route path="/" 
        element={
          <PrivateRoute>
            <LandingPage />
          </PrivateRoute>
         }
      />
      <Route
        path="/home"
        element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        }
      />
      <Route
        path="/excel"
        element={
          <PrivateRoute>
            <ExcelReaderScreen />
          </PrivateRoute>
        }
      />
      </Routes>
    </Router>
  );
}

export default App;
