import React, { useState, useEffect } from "react";

import styled from "@emotion/styled";
// import { columnsFromBackend } from "./kanbanData";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { v4 as uuidv4 } from "uuid"; // Import uuid for generating unique IDs

// const data = [
//     {
//       id: '1',
//       Task: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent.',
//       // Assigned_To: 'Beltran',
//       // Assignee: 'Romona',
//       // Status: 'To-do',
//       // Priority: 'Low',
//       Due_Date: '25-May-2020',
//     },
//     {
//       id: '2',
//       Task: 'Fix Styling',
//       // Assigned_To: 'Dave',
//       // Assignee: 'Romona',
//       // Status: 'To-do',
//       // Priority: 'Low',
//       Due_Date: '26-May-2020',
//     },
//     {
//       id: '3',
//       Task: 'Handle Door Specs',
//       // Assigned_To: 'Roman',
//       // Assignee: 'Romona',
//       // Status: 'To-do',
//       // Priority: 'Low',
//       Due_Date: '27-May-2020',
//     },
//     {
//       id: '4',
//       Task: 'morbi',
//       // Assigned_To: 'Gawen',
//       // Assignee: 'Kai',
//       // Status: 'Done',
//       // Priority: 'High',
//       Due_Date: '23-Aug-2020',
//     },
//     {
//       id: '5',
//       Task: 'proin',
//       // Assigned_To: 'Bondon',
//       // Assignee: 'Antoinette',
//       // Status: 'In Progress',
//       // Priority: 'Medium',
//       Due_Date: '05-Jan-2021',
//     },
//   ];
  
//   export const columnsFromBackend = {
//     [uuidv4()]: {
//       title: 'To-do',
//       items: data,
//     },
//     [uuidv4()]: {
//       title: 'In Progress',
//       items: [],
//     },
//     [uuidv4()]: {
//       title: 'Done',
//       items: [],
//     },
//   };
  

const TaskInformation = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  padding: 0 15px;
  min-height: 106px;
  border-radius: 5px;
  max-width: 311px;
  /* background: ${({ isDragging }) =>
    isDragging ? 'rgba(255, 59, 59, 0.15)' : 'white'}; */
  background: white;
  margin-top: 15px;

  .secondary-details {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    font-size: 12px;
    font-weight: 400px;
    color: #7d7d7d;
  }
  /* .priority{ */
  /* margin-right: 12px; */
  /* align-self: center;
    svg{
      width: 12px !important;
      height: 12px !important;
      margin-right: 12px; */
  /* margin-top: 2px; */
  /* } */
  /* } */
`;
const Container = styled.div`
  display: flex;
`;

const TaskList = styled.div`
  min-height: 100px;
  display: flex;
  flex-direction: column;
  background: #f3f3f3;
  min-width: 341px;
  border-radius: 5px;
  padding: 15px 15px;
  margin-right: 45px;
`;

const TaskColumnStyles = styled.div`
  margin: 8px;
  display: flex;
  width: 100%;
  min-height: 80vh;
`;

const Title = styled.span`
  color: #10957d;
  background: rgba(16, 149, 125, 0.15);
  padding: 2px 10px;
  border-radius: 5px;
  align-self: flex-start;
`;


const Kanban = () => {
  const [columns, setColumns] = useState(columnsFromBackend);

  // Function to ensure unique item IDs within a column
  const ensureUniqueItemIds = (columns) => {
    const seenIds = new Set();
  
    for (const columnId in columns) {
      const column = columns[columnId];
      const items = column.items;
  
      for (const item of items) {
        if (seenIds.has(item.id)) {
          // Generate a new unique ID
          let newId = item.id;
          while (seenIds.has(newId)) {
            newId = uuidv4(); // You can implement your own unique ID generation logic
          }
          
          // Update the item's ID
          item.id = newId;
        }
        
        seenIds.add(item.id);
      }
    }
  };

  // Ensure unique item IDs when the component mounts
  useEffect(() => {
    ensureUniqueItemIds(columns);
  }, [columns]);

  // Rest of your Kanban component remains unchanged
  const onDragEnd = (result, columns, setColumns) => {
    if (!result.destination) return;
    const { source, destination } = result;
    if (source.droppableId !== destination.droppableId) {
      const sourceColumn = columns[source.droppableId];
      const destColumn = columns[destination.droppableId];
      const sourceItems = [...sourceColumn.items];
      const destItems = [...destColumn.items];
      const [removed] = sourceItems.splice(source.index, 1);
      destItems.splice(destination.index, 0, removed);
      setColumns({
        ...columns,
        [source.droppableId]: {
          ...sourceColumn,
          items: sourceItems
        },
        [destination.droppableId]: {
          ...destColumn,
          items: destItems
        }
      });
    } else {
      const column = columns[source.droppableId];
      const copiedItems = [...column.items];
      const [removed] = copiedItems.splice(source.index, 1);
      copiedItems.splice(destination.index, 0, removed);
      setColumns({
        ...columns,
        [source.droppableId]: {
          ...column,
          items: copiedItems
        }
      });
    }
  };

  return (
    <DragDropContext
    onDragEnd={(result) => onDragEnd(result, columns, setColumns)}
>
    <Container>
      <TaskColumnStyles>
        {Object.entries(columns).map(([columnId, column], index) => {
          return (
            <Droppable key={columnId} droppableId={columnId}>
              {(provided, snapshot) => (
                <TaskList
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  <Title>{column.title}</Title>

                  {column.items.map((item, index) =>
                    <Draggable key={item.id} draggableId={item.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <TaskInformation>
                          <p>{item.Task}</p>
                          <div className="secondary-details">
                            <p>
                              <span>
                                {new Date(item.Due_Date).toLocaleDateString('en-us', {
                                  month: 'short',
                                  day: '2-digit',
                                })}
                              </span>
                            </p>
                          </div>
                        </TaskInformation>
                      </div>
                    )}
                  </Draggable>
                  )}
                  {provided.placeholder}
                </TaskList>
              )}
            </Droppable>
          );
        })}
      </TaskColumnStyles>
    </Container>
  </DragDropContext>
);
};

export default Kanban;
