import React, { useState, useEffect, useMemo  } from "react";
import './css/CreateTask.css';


function CreateTask() {
    
    const [linkedData, setLinkedData] = useState({});
    const [actionsList, setActionsList] = useState([]);
    const [taskName, setTaskName] = useState("");
    const [taskDescription, setTaskDescription] = useState("");
    const [selectedAction, setSelectedAction] = useState({ id: null, name: "" });
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedPriority, setSelectedPriority] = useState("");
    const availablePriorities = ["Low", "Normal", "High"];
    const [selectedUser, setSelectedUser] = useState({ id: null, displayName: "" });
    const [selectedDueDate, setSelectedDueDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");


    const filteredActions = useMemo(() => {
      if (searchTerm.length < 2) return actionsList; // Return all actions if searchTerm has less than 2 characters
      return actionsList.filter(action => 
          action.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }, [searchTerm, actionsList]);

    const handleInputChange = (e) => {

      const { name, value } = e.target;
      if (name === "taskName") {
        setTaskName(value);
      } else if (name === "taskDescription") {
        setTaskDescription(value);
      }
    };
  const handleDropdownChange = (e) => {
    const selectedName = e.target.value;
    const selectedActionObj = actionsList.find(action => action.name === selectedName);

    if (selectedActionObj) {
        setSelectedAction({ id: selectedActionObj.id, name: selectedActionObj.name });
    }
    
};

const handleUserDropdownChange = (e) => {
  const selectedUserName = e.target.value;
  const selectedUserObj = linkedData.userNames.find(user => user.displayName === selectedUserName);

  if (selectedUserObj) {
      setSelectedUser({ id: selectedUserObj.id, displayName: selectedUserObj.displayName });
  }
};


    useEffect(() => {
        async function fetchData() {
            try {
              const [actionsResponse, usersResponse] = await Promise.all([
                fetch("http://localhost:5000/actions", {
                    method: "GET",
                    headers: {
                        Accept: "application/json",
                    },
                }),
                fetch("http://localhost:5000/users", {
                    method: "GET",
                    headers: {
                        Accept: "application/json",
                    },
                })
            ]);
            if (!actionsResponse.ok || !usersResponse.ok) {
                    throw new Error(`HTTP error! Status: ${actionsResponse.status}`);
                }

                const actionsData = await actionsResponse.json();
                const usersData = await usersResponse.json();
                console.log("Actions Data:" , actionsData)
                console.log("Users Data:" , usersData);
                const processedData = processAndLinkData(actionsData, usersData);
                setLinkedData(processedData);
                setActionsList(actionsData.actions);
                setSelectedPriority(processedData.TaskPriority || "");
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        }
        fetchData();
    }, []);

    useEffect(() => {
      if (filteredActions.length === 1) {
        setSelectedAction({
          id: filteredActions[0].id,
          name: filteredActions[0].name
        });
      }
  }, [searchTerm, actionsList]);

  const handlePriorityChange = (e) => {
    const newPriority = e.target.value;
    console.log("Changed Priority:", newPriority);
    setSelectedPriority(newPriority);
  };
    
  
  const handleSave = async () => {
    const combinedDueDate = `${selectedDueDate} ${selectedTime}`;
        try {
            const response = await fetch(`http://localhost:5000/tasks`, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    taskName: taskName,
                    actionId: selectedAction.id,
                    actionName: selectedAction,
                    taskDescription: taskDescription,
                    priority: selectedPriority,
                    userId: String(selectedUser.id),
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
        }
    };

    const processAndLinkData = (actionsData, usersData) => {
      const matterNames = actionsData.actions.map(action => action.name).join(', ');
      const userNames = usersData.linked.participants;

        const processedData = {
            
            MatterNames: matterNames,
            userNames: userNames

        };
        return processedData;
    };

    if (!linkedData || actionsList.length === 0) {
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
  
    // console.timeEnd('CreateTask Execution Time');
    return (
      <div className="main-content">
      <div>
      <div className="header">
        <h1>Create Task:</h1>
      </div>
     
      <div className="matter-id-box">
        <h2>Task name:</h2>
        <input
          type="text"
          id="fname"
          name="taskName"
          value={taskName}
          onChange={handleInputChange}
        />
        <br />
        <br />

        <h2>Select Matter:</h2>
        <input
          type="text"
          placeholder="Search for a Matter..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select value={selectedAction.name} onChange={handleDropdownChange}>
          {filteredActions.map((action) => (
            <option key={action.id} value={action.name} data-id={action.id}>
              {action.id} - {action.name}
            </option>
          ))}
        </select>
        <br />
        <br />

        <h2>Task Description:</h2>
        <input
          type="text"
          id="task_description"
          name="taskDescription"
          value={taskDescription}
          onChange={handleInputChange}
        />
        <br />
        <br />
        <h2>Task Priority:</h2>
        <select value={selectedPriority} onChange={handlePriorityChange}>
          {availablePriorities.map((priority, index) => (
            <option key={index} value={priority}>
              {priority}
            </option>
          ))}
        </select>
        <br />
        <br />
        <h2>Select Assigned User:</h2>
        <select
          value={selectedUser.displayName}
          onChange={handleUserDropdownChange}
        >
         {linkedData.userNames && linkedData.userNames.map((user) => (
            <option key={user.id} value={user.displayName} data-id={user.id}>
              {user.displayName}
            </option>
          ))}
        </select>
        <br />
        <br />
        <h2> Due Date:</h2>
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
         <br />
        <br />
        <button onClick={handleSave} className="button">
          save
        </button>
      </div>
      </div>
      </div>
    );
}

export default CreateTask;
