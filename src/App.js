import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Simulator from "./Simulator";
import Result from "./Result";
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Simulator />} />
        <Route path="/result" element={<Result />} />
      </Routes>
    </Router>
  );
}

export default App;