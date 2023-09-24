import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./css/matterdetails.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { act } from "react-dom/test-utils";

function MatterDetails() {
  const [linkedData, setLinkedData] = useState(null);

  let { id } = useParams();

  useEffect(() => {
    async function fetchData() {
      try {
        const [actionResponse, tasksResponse, timeEntriesResponse, filenotesResponse] = await Promise.all([
          fetch(`http://localhost:5000/action/${id}`, {
            headers: {
              Accept: "application/json",
            },
          }),
          fetch(`http://localhost:5000/task/${id}`, {
            headers: {
              Accept: "application/json",
            },
          }),
          fetch(`http://localhost:5000/timeentries/${id}`, {  // New fetch call for timeentries
          headers: {
            Accept: "application/json",
          },
        }),
        fetch(`http://localhost:5000/notes/${id}`, {  // New fetch call for timeentries
          headers: {
            Accept: "application/json",
          },
        }),

        ]);
        const actionData = await actionResponse.json();
        const tasksData = await tasksResponse.json();
        const timeEntriesData = await timeEntriesResponse.json();
        const notesData = await filenotesResponse.json();

        console.log(notesData)
        // Process and link data here
        const processedData = processAndLinkData(actionData, tasksData, timeEntriesData, notesData);
        
        setLinkedData(processedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    fetchData();
  }, []);

  const processAndLinkData = (actionData, tasksData, timeEntriesData, notesData) => {
    // Process and link your data here

    var numberTasks = 0;
    var completeTasks = 0;
    var overdueTasks = 0;
    let roundedBillableAmount = "$" + parseFloat(timeEntriesData.total_billable_amount).toFixed(2);
    let roundedBillableHours = parseFloat(timeEntriesData.total_billable_hours).toFixed(2);
    var tableData = []

    if (tasksData["status_code"] == 200) { // If there are tasks.
      numberTasks = tasksData.tasks.length
      tableData = tasksData.tableData
      completeTasks = tasksData.taskCount.complete
      overdueTasks = tasksData.taskCount.overdue
    } 
   
    const processedData = {
      id: actionData.actions.id,
      numTasks: numberTasks,
      completedTasks: completeTasks,
      overdueTasks: overdueTasks,
      tableData: tableData,
      billableAmount: roundedBillableAmount,
      billableHours: roundedBillableHours,
      filenotes: notesData,
      name: actionData.actions.name,
      createdTimestamp: actionData.actions.createdTimestamp,
      modifiedTimestamp: actionData.actions.modifiedTimestamp,
      lastAccessTimestamp: actionData.actions.lastAccessTimestamp,
      actionTypeName: actionData.linked.actiontypes.find(
        (x) => String(x.id) === actionData.actions.links.actionType
      ).name,
      assignedToName: actionData.linked.participants.find(
        (x) => String(x.id) === actionData.actions.links.assignedTo
      ),
      WorkflowStepName: actionData.linked.steps.find(
        (x) => String(x.id) === actionData.actions.links.step
      ).stepName,
      ParticipantNames:
        actionData.actions.links.primaryParticipants?.map((participantId) => {
          const participant = actionData.linked.participants.find(
            (p) => p.id == participantId
          );
          if (participant?.isCompany === "T") {
            return {
                id: participant?.id,
                companyName: participant?.companyName,
                email: participant?.email,
                phone: ("+" + String(participant?.phone1Country) + "(" + String(participant?.phone1Area) + ")" + participant?.phone1Number),
            };
        } else {
            return {
                id: participant?.id,
                firstName: participant?.firstName,
                lastName: participant?.lastName,
                email: participant?.email,
                phone: ("+" + String(participant?.phone1Country) + "(" + String(participant?.phone1Area) + ")" + participant?.phone1Number),
            };
          }
        }) || [],
    };
    console.log(processedData.filenotes);

    return processedData;
 
  };

  const daysSinceModified = (modifiedTimestamp) => {
    const modifiedDate = new Date(modifiedTimestamp);
    const today = new Date();

    // Resetting the time part of the dates to ensure accurate day difference calculation
    modifiedDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const differenceInTime = today - modifiedDate;
    // console.log(differenceInTime)
    const differenceInDays = differenceInTime / (1000 * 3600 * 24);
    //  const taskNames = tasksData.tableData.map(task => task.Name);


    return differenceInDays;
  };

  if (!linkedData) {
    return <p>Loading...</p>;
  }

  return (
    <div key={linkedData.id} className="row">
      <div className="col-lg-6 matter-id-box">
        <h2>Matter ID: {linkedData.id}</h2>
      </div>
      <div className="col-lg-6 matter-id-box">
        <h2>Billable Hours: {linkedData.billableHours}</h2>
      </div>
      <div className="col-lg-6 matter-id-box">
        <h2>Billable Amount: {linkedData.billableAmount}</h2>
      </div>
      

      <div className="col-lg-6 matter-id-box">
        <h2>Total Tasks: {linkedData.numTasks}</h2>
      </div>

      <div className="col-lg-6 matter-id-box">
        <h2>Completed Tasks: {linkedData.completedTasks}</h2>
      </div>

      <div className="col-lg-6 matter-id-box">
        <h2>Overdue Tasks: {linkedData.overdueTasks}</h2>
      </div>

     
      

      <div className="col-lg-4 matter-id-box">
        <p>
          Days Since Opened:{" "}
          {linkedData.modifiedTimestamp
            ? daysSinceModified(linkedData.modifiedTimestamp)
            : "N/A"}
        </p>
      </div>
      <div className="col-lg-12 details-box">
        <p>Matter Name: {linkedData.name ? linkedData.name : "N/A"}</p>

        <p>
          Matter Type:{" "}
          {linkedData.actionTypeName ? linkedData.actionTypeName : "N/A"}
        </p>

        <hr />

        <p>
          Date Created:{" "}
          {linkedData.createdTimestamp ? linkedData.createdTimestamp : "N/A"}
        </p>
        <p>
          Date Modified:{" "}
          {linkedData.modifiedTimestamp
            ? new Date(linkedData.modifiedTimestamp).toISOString().split("T")[0]
            : "N/A"}
        </p>
        <p>
          Last Accessed:{" "}
          {linkedData.lastAccessTimestamp
            ? new Date(linkedData.lastAccessTimestamp)
                .toISOString()
                .split("T")[0]
            : "N/A"}
        </p>
        <hr />

        <p>
          Assigned To:{" "}
          {linkedData.assignedToName
            ? `${linkedData.assignedToName.firstName} ${linkedData.assignedToName.lastName}`
            : "N/A"}
        </p>
        <p>
          Workflow Step:{" "}
          {linkedData.WorkflowStepName ? linkedData.WorkflowStepName : "N/A"}
        </p>
      </div>
      <div className="col-lg-6 client-id-box">
    Participants:{" "}
    {linkedData.ParticipantNames
        ? linkedData.ParticipantNames.map((participant) => (
            <div key={participant.id}>
                {participant.companyName ? participant.companyName : `${participant.firstName} ${participant.lastName}`}{" "}, 
                {participant.email ? participant.email : "Email not available"}{" "},  
                {participant.phone ? participant.phone : "Phone not available"}
            </div>
        ))
        : "N/A"}
</div>
<div className="col-lg-6">
      <h2>Tasks</h2>

      {linkedData.tableData && linkedData.tableData.length > 0 ? (
  <table className="table table-bordered">
    <thead>
      <tr>
        <th>Task Name</th>
        <th>Assigned To</th>
        <th>Due Date</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      {linkedData.tableData.map((task, index) => (
        <tr key={index}>
          <td>{task.Name}</td>
          <td>{task.AssignedTo}</td>
          <td>{task['Due Date']}</td>
          <td>{task.Status}</td>
        </tr>
      ))}
    </tbody>
  </table>
) : (
  <div>No tasks found</div>
)}

    </div>
    <div className="col-lg-6 filenotes-box">
      <h2>Filenotes:</h2>
      {console.log(linkedData.filenotes)}
      {linkedData.filenotes ? (
        linkedData.filenotes.map((filenote, index) => (
          <div key={index}  className="filenote-record">
            <div>Entered By: {filenote.createdBy.displayName}</div>
            <div>Note: {filenote.content}</div>
            <hr />
          </div>
        ))
      ) : (
        <div>No filenotes found</div>
      )}
    </div>

    </div>
  );
}

export default MatterDetails;
