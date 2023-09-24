import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./css/TaskDetails.css";
import "bootstrap/dist/css/bootstrap.min.css";

function TaskDetails() {
  const [linkedData, setLinkedData] = useState(null);
  const [selectedActionId, setSelectedActionId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [editedTaskDescription, setEditedTaskDescription] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("");
  const availablePriorities = ["Low", "Normal", "High"];
  const [selectedDueDate, setSelectedDueDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  
  
  let { id } = useParams();

  const filteredActions = linkedData 
  ? linkedData.MatterNames.filter((action) =>
      action.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  : [];


  //   console.log(id)

  useEffect(() => {
    async function fetchData() {
      try {
        const [tasksResponse, actionsResponse] = await Promise.all([
          fetch(`http://localhost:5000/create_task/${id}`, {
            headers: {
              Accept: "application/json",
            },
          }),
          fetch("http://localhost:5000/actions", {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          }),
        ]);

        if (!tasksResponse.ok) {
          throw new Error(`HTTP error! Status: ${tasksResponse.status}`);
        }

        const task = await tasksResponse.json();
        const actionsData = await actionsResponse.json();

        const processedData = processAndLinkData(task, actionsData);
        setEditedTaskDescription(processedData.TaskDescription ? processedData.TaskDescription : "");
        setSelectedPriority(processedData.TaskPriority);
        setSelectedDueDate(processedData.TaskDueDate ? processedData.TaskDueDate : "");

        console.log("Initial Priority:", selectedPriority);
        
        console.log(task);
        setLinkedData(processedData);
        setSelectedActionId(processedData.MatterId);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    fetchData();
  }, [id]);

  useEffect(() => {
    if (filteredActions.length === 1) {
      setSelectedActionId(filteredActions[0].id);
    }
  }, [filteredActions]);

  const handlePriorityChange = (e) => {
    const newPriority = e.target.value;
    console.log("Changed Priority:", newPriority);
    setSelectedPriority(newPriority);
  };
  

  const handleSave = async () => {
    const combinedDueDate = `${selectedDueDate} ${selectedTime}`;
    try {
      const response = await fetch(`http://localhost:5000/tasks`, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          taskId: linkedData.TaskId,
          actionId: selectedActionId,
          description: editedTaskDescription,
          priority: selectedPriority,
          dueDate: combinedDueDate,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      alert("Data successfully saved!");
    } catch (error) {
      console.error("Error saving data:", error);
      // Handle the error, maybe show an error message to the user
    }
  };

  const processAndLinkData = (task, actionsData) => {

    const dueDate = task.tasks.dueTimestamp ? new Date(task.tasks.dueTimestamp).toISOString().split("T")[0] : "";


    const processedData = {
      TaskName: task.tasks.name,
      MatterId: task.tasks.links.action,
      TaskId: task.tasks.id,
      MatterNames: actionsData.actions,
      //   MatterName: matchingAction ? matchingAction.name : "N/A",
      TaskDescription: task.tasks.description,
      TaskPriority: task.tasks.priority,
      TaskDueDate: dueDate,
    };

    return processedData;
  };
  if (!linkedData) {
    return (
      <div className="spinner-container">
          <div className="spinner">
              <svg className="spinner-circle" viewBox="0 0 50 50">
                  <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" style={{stopColor: "rgba(255,0,150,1)", stopOpacity: 1}} />
                          <stop offset="100%" style={{stopColor: "rgba(0,204,255,1)", stopOpacity: 1}} />
                      </linearGradient>
                  </defs>
                  <circle cx="25" cy="25" r="23" strokeWidth="4" stroke="url(#gradient)"></circle>
              </svg>
          </div>
      </div>
  );
  }

  return (
    <div className="row">
      <div className="col-lg-6 matter-id-box">
        <h2>Task Name: {linkedData.TaskName}</h2>
        {/* <h2>Matter ID: {linkedData.MatterId}</h2> */}

        <h2>Matter Names:</h2>
        <input
          type="text"
          placeholder="Search for a Matter..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          value={selectedActionId}
          onChange={(e) => setSelectedActionId(e.target.value)}
        >
          {filteredActions.map((action, index) => (
            <option key={index} value={action.id}>
              {action.id} - {action.name}
            </option>
          ))}
        </select>

        <h2>Task description:</h2>
        <textarea
          value={editedTaskDescription}
          onChange={(e) => setEditedTaskDescription(e.target.value)}
          rows="4"
          cols="50"
        />
        <h2>Task Priority:</h2>
        <select value={selectedPriority} onChange={handlePriorityChange}>
          {availablePriorities.map((priority, index) => (
            <option key={index} value={priority}>
              {priority}
            </option>
          ))}
        </select>
        <h2>Task Due Date:</h2>
        <input
          type="date"
          value={selectedDueDate}
          onChange={(e) => setSelectedDueDate(e.target.value)}
        />
        <input
          type="time"
          value={selectedTime}
          onChange={(e) => setSelectedTime(e.target.value)}
        />

        <button onClick={handleSave}>Save</button>
      </div>
    </div>
  );
}

export default TaskDetails;
