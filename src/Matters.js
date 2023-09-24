import React, { useEffect, useState } from "react";
import {Link} from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';

function Matters({ actionId }) {
  const [linkedData, setLinkedData] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("http://localhost:5000/actions", {
          headers: {
            Accept: "application/json",
          },
        });
        const responseData = await response.json();
        console.log(responseData)
        // Process and link data here
        const processedData = processAndLinkData(responseData);

        setLinkedData(processedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    fetchData();
  }, [actionId]);

  const processAndLinkData = (data) => {
    // Process and link your data here

    const processedData = data["actions"].map((action) => ({
      id: action.id,
      name: action.name,
      createdTimestamp: action.createdTimestamp,
      modifiedTimestamp: action.modifiedTimestamp,
      lastAccessTimestamp: action.lastAccessTimestamp,
      actionType: data.linked.actiontypes.find(
        (p) => p.id == action.links.actionType
      ),
      primaryParticipants:
        action.links.primaryParticipants?.map((participantId) => {
          const participant = data.linked.participants.find(
            (p) => p.id == participantId
          );
          return {
            firstName: participant?.firstName,
            lastName: participant?.lastName,
          };
        }) || [],

      assignedTo: data.linked.participants.find(
        (p) => p.id == action.links.assignedTo
      ),

      step: data.linked.steps.find((p) => p.id == action.links.step),
    }));

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
    <div className="main-content">
    <table className="styled-table">
      <thead>
        <tr>
          <th>Matter ID</th>
          <th>Matter Type</th>
          <th>Workflow Step</th>
          <th>Matter Name</th>
          <th>Date Created</th>
          <th>Date Modified</th>
          <th>Last Accessed</th>
          <th>Client Names</th>
          <th>Assigned to</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {linkedData.map((data) => (
          <tr key={data.id}>
            <td>{data.id}</td>
            <td>{data.actionType ? data.actionType.name : "N/A"}</td>
            <td>{data.step ? data.step.stepName : "N/A"}</td>
            <td>{data.name ? data.name : "N/A"}</td>
            <td>{data.createdTimestamp ? data.createdTimestamp : "N/A"}</td>
            <td>{data.modifiedTimestamp ? data.modifiedTimestamp : "N/A"}</td>
            <td>{data.lastAccessTimestamp ? data.lastAccessTimestamp : "N/A"}</td>
            <td>
              <ul>
                {data.primaryParticipants ? (
                  data.primaryParticipants.map((participant, index) => (
                    <li key={index}>
                      {participant.firstName} {participant.lastName}
                    </li>
                  ))
                ) : (
                  <li>No client names available</li>
                )}
              </ul>
            </td>
            <td>
              {data.assignedTo
                ? `${data.assignedTo.firstName} ${data.assignedTo.lastName}`
                : "N/A"}
            </td>
            <td>
            <div>
              <Link to={`/matterdetail/${data.id}`}>
              <FontAwesomeIcon icon={faEdit} />
              </Link>
            </div>
            
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    </div>
  );
  
}

export default Matters;
