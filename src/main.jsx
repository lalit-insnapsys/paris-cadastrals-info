import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import DistrictPage from "./pages/DistrictPage";
import PlanningPermits from "./Pages/PlanningPermits";
import "bootstrap/dist/css/bootstrap.min.css";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/planning-permits" element={<PlanningPermits />} />
                <Route path="/district/:districtCode" element={<DistrictPage />} />
            </Routes>
        </Router>
    </React.StrictMode>
);
