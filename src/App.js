// App.js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./screens/Home";
import ExistingProducts from "./screens/ExistingProducts";
import ExcelReaderScreen from "./screens/excel";
import LandingPage from "./screens/Landing";
import PrivateRoute from "./screens/PrivateRoute";

function App() {
  return (
    <Router>
      <Routes>
      <Route path="/" 
        element={ <LandingPage /> }
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
        path="/existing-products"
        element={<ExistingProducts />}
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
