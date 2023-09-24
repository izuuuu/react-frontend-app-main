import React, { useEffect, useState } from "react";
import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";

import Login from "./login";
import Dashboard from "./Dashboard";
import Matters from "./Matters";
import TaskPane from "./taskpane";
import Pipeline from "./pipeline";
// import Kanban from './kanban';
import Test from "./TESTKANBAN";
import MatterDetails from "./matterdetails";
import Tasks from "./Tasks";
import TaskDetails from "./TaskDetails";
import CreateTask from "./CreateTask";
import TaskPipeline from "./TaskPipeline";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <Router>
      <div className={"container-fluid mx-0 px-0"}>
        <div className={"row"}>
          <div className={"col side-bar"}>
            <TaskPane />
          </div>
          <div className={"col mx-0 px-0"}>
            <Routes>
              <Route
                path="/"
                element={<Login setIsAuthenticated={setIsAuthenticated} />}
              />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route element={<Navigate to="/login" />} />
              <Route path="/matters" element={<Matters />} />
              <Route path="/pipeline" element={<Pipeline />} />
              <Route exact path="/matterdetail/:id" element={<MatterDetails />} />
              <Route exact path="/Tasks" element={<Tasks />} />
              <Route path="/TaskPipeline" element={<TaskPipeline />} />
              <Route exact path="/TaskDetails/:id" element={<TaskDetails />} />
              <Route exact path="/CreateTask" element={<CreateTask />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
