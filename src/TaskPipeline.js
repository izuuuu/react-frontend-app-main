import React, { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import "./css/TaskPipeline.css";

function TaskPipeline({ actionId }) {
  const [linkedData, setLinkedData] = useState({
    linked: { actions: [], actiontypes: [] },
  });
  const [taskStatusFilter, setTaskStatusFilter] = useState("");
  const [users, setUsers] = useState([]);
  const [userFilter, setUserFilter] = useState("");
  const [actionTypeFilter, setActionTypeFilter] = useState("");
  const [actionTypes, setActionTypes] = useState([]);

  // const [pipeline, setPipeline] = useState([
  //   { client_id: "loading...", matter_id: "loading...", step: "loading..." },
  // ]);

  const [columns, setColumns] = useState({
    0: [],
    1: [],
    2: [],
    3: [],
    4: [],
  });

  const columnNameMap = {
    0: "New Task",
    1: "In-Progress",
    2: "Wrap-Up",
    3: "Review",
    4: "Complete",
  };

  const calculateDaysUntilDue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const differenceInTime = due.getTime() - today.getTime();
    const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));

    if (differenceInDays > 0) {
      return { due: ` ${differenceInDays}` };
    } else if (differenceInDays < 0) {
      return { overdue: ` ${Math.abs(differenceInDays)}` };
    } else {
      return { due: " Task is due today" };
    }
  };

  useEffect(() => {
    let isMounted = true; // A flag to check if the component is still mounted

    async function fetchData() {
      try {
        const [TasksResponse, pipelineResponse, usersResponse] =
          await Promise.all([
            fetch("http://localhost:5000/tasks", {
              method: "GET",
              headers: {
                Accept: "application/json",
              },
            }),
            fetch("http://localhost:5000/pipeline?type=task", {
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
            }),
          ]);

        if (!isMounted) {
          return;
        }

        const pipelineData = await pipelineResponse.json();
        const TasksData = await TasksResponse.json();
        const usersData = await usersResponse.json();
        setUsers(usersData.linked.participants);

        setActionTypes(TasksData.linked.actiontypes);

        // const actionData = await ActionsResponse.json();
        // const actionNameMap = actionData.actions.reduce((acc, action) => {
        //   acc[action.id] = action.name;
        //   return acc;
        // }, {});

        // console.log("pipeline Data", pipelineData)
        // console.log("Tasks Data", TasksData);

        TasksData["pipeline"] = pipelineData;
        const processedData = processAndLinkData(TasksData);
        setLinkedData(processedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    fetchData();

    return () => {
      isMounted = false; // Set the flag to indicate that the component is unmounted
      // You can add additional cleanup logic here if needed
    };
  }, [actionId]);

  const processAndLinkData = (data) => {
    // console.log("processAndLinkData called");
    // console.log("Received Data:", data);
    if (!data || !data["tasks"] || !data["pipeline"]) {
      console.error("Expected data structure not found");
      return;
    }

    // Extract tasks and pipeline from the data
    const tasks = data["tasks"];
    const pipeline = data["pipeline"];

    console.log("Tasks:", tasks);  // Print tasks
    console.log("Pipeline:", pipeline);  // Print pipeline

    const processedData = tasks.map((task) => ({
      id: task.id,
      name: task.name,
      TaskStatus: task.status,
      TaskDueDate: task.dueTimestamp,
      TaskCreatedDate: task.startedTimestamp,

      actionName: data.actionMap[task.links.action].name,

      actionTypeName:
        data.actionTypeMap[data.actionMap[task.links.action].links.actionType]
          .name,

      step: pipeline[task.id],
      assignee: task.links.assignee,
    }));
    console.log("Tasks Data", processedData);
    var tempColumns = {
      0: [],
      1: [],
      2: [],
      3: [],
      4: [],
    };

    // console.log("processedData:", processedData);
    processedData.forEach((task) => {
      if (tempColumns.hasOwnProperty(task.step)) {
        tempColumns[task.step].push(task);
      } else {
        console.warn(
          `Task with invalid step: ${task.step} for task ID: ${task.id}`
        );
      }
    });

    setColumns(tempColumns);

    return processedData;
    // return columns;
  };

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

  async function updateActionStep(task_id, source_id, destination_id) {
    try {
      const response = await fetch("http://localhost:5000/pipeline?type=task", {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          task_id: task_id,
          source: source_id,
          destination: destination_id,
        }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const responseData = await response.json();
      //   console.log(responseData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  const filterTasks = (
    column,
    taskStatusFilter,
    userFilter,
    actionTypeFilter,
    linkedActions
  ) => {
    let filteredTasks = column;

    // Filter by task status
    if (taskStatusFilter) {
      filteredTasks = filteredTasks.filter(
        (task) => task.TaskStatus === taskStatusFilter
      );
    }

    // Filter by assignee
    if (userFilter) {
      filteredTasks = filteredTasks.filter(
        (task) => task.assignee === userFilter
      );
    }

    // console.log("TEST ", filteredTasks);
    // console.log("Linkydinky ", linkedData);
    // console.log("Outside filter - Selected action type:", actionTypeFilter);

    // Filter by action type name
    if (actionTypeFilter) {
      filteredTasks = filteredTasks.filter((task) => {
        if (task.actionTypeName === actionTypeFilter) {
          return task;
        } else {
          return;
        }
      });
    }

    return filteredTasks;
  };

  // Define the onDragEnd function to handle the drag-and-drop behavior
  const onDragEnd = (result, columns, setColumns) => {
    if (!result.destination) return;
    const { source, destination } = result;

    const start = columns[source.droppableId];
    const end = columns[destination.droppableId];

    if (start === end) {
      const newList = Array.from(start);
      const [removed] = newList.splice(source.index, 1);
      newList.splice(destination.index, 0, removed);
      setColumns({
        ...columns,
        [source.droppableId]: newList,
      });
    } else {
      //   console.log(start[source.index].id + "->" + destination.droppableId);

      updateActionStep(
        start[source.index].id,
        source.droppableId,
        destination.droppableId
      );

      const startList = Array.from(start);
      const [removed] = startList.splice(source.index, 1);
      const endList = Array.from(end);
      endList.splice(destination.index, 0, removed);
      setColumns({
        ...columns,
        [source.droppableId]: startList,
        [destination.droppableId]: endList,
      });
    }
  };

  return (
    <div className={"container"}>
      <div className="row">

        <div className="col-sm">
          <div className="action-type-filter">
            <label>Filter by Action Type: </label>
            <select
              value={actionTypeFilter}
              onChange={(e) => setActionTypeFilter(e.target.value)}
            >
              <option value="">All</option>
              {actionTypes.map((actionType) => (
                <option key={actionType.id} value={actionType.name}>
                  {actionType.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="col-sm">
          <div className="user-filter">
            <label>Filter by User: </label>
            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
            >
              <option value="">All</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.displayName}
                </option>
              ))}
            </select>
          </div>
        </div>
      
        <div className="col-sm">
          <div className="task-status-filter">
            <label>Filter by Task Status: </label>
            <select
              value={taskStatusFilter}
              onChange={(e) => setTaskStatusFilter(e.target.value)}
            >
              <option value="">All</option>
              <option value="Complete">Complete</option>
              <option value="Incomplete">Incomplete</option>
            </select>
          </div>
        </div>
     
    </div>
    
    <div className={"row"}>
          <DragDropContext
            onDragEnd={(result) => onDragEnd(result, columns, setColumns)}
          >
            {Object.entries(columns).map(([columnId, column], index) => {
              let filteredTasks = filterTasks(
                column,
                taskStatusFilter,
                userFilter,
                actionTypeFilter
              );

              return (
                <Droppable key={columnId} droppableId={columnId} >
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="col-sm column"
                    >
                      <h2>{columnNameMap[columnId]}</h2>
                      {filteredTasks.map((data, index) => (
                        <Draggable
                          key={String(data.id)}
                          draggableId={String(data.id)}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="draggable-item"
                            >
                              <h3>Task Title: {data.name ? data.name : "N/A"}</h3>

                              <p>Matter Name: {data.actionName}</p>
                              <p>Task ID: {data.id}</p>

                              <p>
                                Task Status:{" "}
                                {data.TaskStatus ? data.TaskStatus : "N/A"}
                              </p>

                              <p>
                                Date Created:{" "}
                                {data.TaskCreatedDate
                                  ? new Date(data.TaskCreatedDate)
                                      .toISOString()
                                      .split("T")[0]
                                  : "N/A"}
                              </p>
                              <p>
                                Due date:{" "}
                                {data.TaskDueDate
                                  ? new Date(data.TaskDueDate)
                                      .toISOString()
                                      .split("T")[0]
                                  : "N/A"}
                              </p>
                              {data.TaskDueDate ? (
                                data.TaskStatus != "Complete" ? (
                                  calculateDaysUntilDue(
                                    data.TaskDueDate
                                  ).hasOwnProperty("due") ? (
                                    <p>
                                      Days until Due:
                                      {
                                        calculateDaysUntilDue(data.TaskDueDate)[
                                          "due"
                                        ]
                                      }
                                    </p>
                                  ) : (
                                    <p style={{ color: "red" }}>
                                      Days Overdue:
                                      {
                                        calculateDaysUntilDue(data.TaskDueDate)[
                                          "overdue"
                                        ]
                                      }
                                    </p>
                                  )
                                ) : (
                                  <p></p>
                                )
                              ) : (
                                "N/A"
                              )}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              );
            })}
          </DragDropContext>
        </div>
      
    </div>
  );
}

export default TaskPipeline;
