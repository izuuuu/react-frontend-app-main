import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./css/tasks.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import CreateTask from "./CreateTask";

function Tasks() {
  const [linkedData, setLinkedData] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("http://localhost:5000/tasks", {
          headers: {
            Accept: "application/json",
          },
        });
        const responseData = await response.json();
        // Process and link data here
        const processedData = processAndLinkData(responseData);
        setLinkedData(processedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    fetchData();
  }, []);

  const processAndLinkData = (data) => {
    // Process and link your data here

    const processedData = data.tasks.map((task) => ({
      id: task.id,
      status: task.status,
      priority: task.priority,
      name: task.name,
      MatterId: task.links.action,
      Assignee: data.linked.participants.find(
        (a) => String(a.id) == task.links.assignee
      ),
      AssignedBy: task.assignedBy,
      DueDate: task.dueTimestamp,
      DateCompleted: task.completedTimestamp,
    }));

    return processedData;
  };

  console.log(linkedData)

  if (!linkedData) {
    return (
      <div className="spinner-container">
        <div className="spinner">
          <svg className="spinner-circle" viewBox="0 0 50 50">
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop
                  offset="0%"
                  style={{ stopColor: "rgba(255,0,150,1)", stopOpacity: 1 }}
                />
                <stop
                  offset="100%"
                  style={{ stopColor: "rgba(0,204,255,1)", stopOpacity: 1 }}
                />
              </linearGradient>
            </defs>
            <circle
              cx="25"
              cy="25"
              r="23"
              strokeWidth="4"
              stroke="url(#gradient)"
            ></circle>
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
    <div className="col-lg-12">
      <Link to="/CreateTask">
        {" "}
        <br/>
        <button className="button">Create Task</button>
      </Link>
<br />
<br />
      <table className="styled-table">
        <thead>
          <tr>
            <th>Status</th>
            <th>Priority</th>
            <th>Name</th>
            <th>Matter ID</th>
            <th>Assignee</th>
            <th>Assigned By</th>
            <th>Due Date</th>
            <th>Date Completed</th>
            <th>Edit</th>
          </tr>
        </thead>
        <tbody>
          {linkedData.map((data, index) => (
            <tr key={index}>
              <td>{data.status}</td>
              <td>{data.priority ? data.priority : "N/A"}</td>
              <td>{data.name ? data.name : "N/A"}</td>
              <td>{data.MatterId ? data.MatterId : "N/A"}</td>
              <td>
                {data.Assignee
                  ? `${data.Assignee.firstName} ${data.Assignee.lastName}`
                  : "N/A"}
              </td>
              <td>{data.AssignedBy ? data.AssignedBy : "N/A"}</td>
              <td>
                {data.DueDate
                  ? new Date(data.DueDate).toISOString().split("T")[0]
                  : "N/A"}
              </td>
              <td>
                {data.DateCompleted
                  ? new Date(data.DateCompleted).toISOString().split("T")[0]
                  : "N/A"}
              </td>
              <td>
                <div>
                  <Link to={`/TaskDetails/${data.id}`}>
                    <FontAwesomeIcon icon={faEdit} />
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </div>
  );
}

export default Tasks;
