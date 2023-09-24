import React, { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import './css/pipeline.css';


function Pipeline({ actionId }) {
  const [linkedData, setLinkedData] = useState(null);
  // const [pipeline, setPipeline] = useState([
  //   { client_id: "loading...", matter_id: "loading...", step: "loading..." },
  // ]);

  const [columns, setColumns] = useState({
    '0': [],
    '1': [],
    '2': [],
    '3': [],
    '4': [],
  });

  const columnNameMap = {'0': "Initiation", '1': "Preparation", '2': "In-Progress", '3': "Wrap-Up", '4': "Closed",}

  useEffect(() => {
    let isMounted = true; // A flag to check if the component is still mounted

    async function fetchData() {
      try {
        const [actionsResponse, pipelineResponse] = await Promise.all([
          fetch("http://localhost:5000/actions", {
            method: 'GET',
            headers: {
              Accept: "application/json",
            },
          }),
          fetch("http://localhost:5000/pipeline?type=action", {
            method: 'GET',
            headers: {
              Accept: "application/json",
            },
          }),
        ]);

        if (!isMounted) {
          return;
        }

        const pipelineData = await pipelineResponse.json();
        const actionsData = await actionsResponse.json();
        
        console.log("TEST", actionsData)


        actionsData["pipeline"] = pipelineData;

        
        const processedData = processAndLinkData(actionsData);
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
    // Process and link your data here
    const processedData = data["actions"].map((action) => ({
      id: action.id,
      name: action.name,
      createdTimestamp: action.createdTimestamp,
      modifiedTimestamp: action.modifiedTimestamp,
      lastAccessTimestamp: action.lastAccessTimestamp,
      actionType: data.actionTypeMap[action.links.actionType],
      step: data.pipeline[action.id],
    }));

    var tempColumns = {
      '0': [],
      '1': [],
      '2': [],
      '3': [],
      '4': [],
    }
    console.log(processedData)
    processedData.forEach((action) => {
      if (tempColumns.hasOwnProperty(action.step)) {
        tempColumns[action.step].push(action);
      } else {
        // Handle cases where the step value doesn't match any column
        // You can choose to ignore these actions or handle them differently
        console.warn(`Action with invalid step: ${action.step}`);
      }
    });

    setColumns(tempColumns)

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

  async function updateActionStep(matter_id, source_id, destination_id) {
    try {
      const updateResponse = await fetch("http://localhost:5000/pipeline?type=action", {
          method: 'PUT',
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            matter_id: matter_id,
            source: source_id,
            destination: destination_id
          })
        })
      }
      catch (error) {
        console.error("Error fetching data:", error);
      }
    }

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
        console.log(start[source.index].id + "->" + destination.droppableId)

        updateActionStep(start[source.index].id, source.droppableId,  destination.droppableId)

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
    <div className="main-content">
    <div className="container-drag">
      <DragDropContext onDragEnd={(result) => onDragEnd(result, columns, setColumns)}>
        {Object.entries(columns).map(([columnId, column], index) => (

            <Droppable key={columnId} droppableId={columnId}>
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="column"
                >          
                  <h2>{columnNameMap[columnId]}</h2>
                  {columns[columnId].map((data, index) => (
              
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
                          <h3>Matter ID: {data.id}</h3>
                          <p>Matter Name: {data.name ? data.name : "N/A"}</p>
                          <p>
                            Date Created:{" "}
                            {data.createdTimestamp
                              ? data.createdTimestamp
                              : "N/A"}
                          </p>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>

        ))}
      </DragDropContext>
    </div>
    </div>
  );
  
}

export default Pipeline;
