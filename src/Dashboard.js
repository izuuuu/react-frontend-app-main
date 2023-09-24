import React, { useEffect, useState, useRef } from 'react';
import './css/Dashboard.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);




// export const formattedChartData = {
//   labels: [1,2,3],
//   datasets: [
//     {
//       label: 'Newly Opened Actions',
//       borderColor: 'rgb(255, 99, 132)',
//       borderWidth: 2,
//       fill: false,
//       data: [1,2,3],
//     },
//   ],
// };

function Dashboard({}) {
  const [actionCount, setActiveActionCount] = useState({ active: 0, closed: 0 });
  const [taskCount, setTaskCount] = useState({ complete: 0, incomplete: 0, overdue: 0 });
  const [actionTypeCount, setactionTypeCount] = useState({});
  const [participantMap, setTaskAssignee] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState({
    labels: ['LOADING...'],
    datasets: [
      {
        label: 'LOADING...',
        borderColor: 'rgb(255, 99, 132)',
        borderWidth: 2,
        fill: false,
        data: [0],
      },
    ],});
  // const [chartRef, setChartRef] = useState({});

  // const [isAuthorized, setIsAuthorized] = useState(false); // Track if the user is authorized
   
  

  useEffect(() => {
    //  async function formattedData(){
    //   try {
    //     // Fetch data when authorized
    //     const response = await fetch('http://localhost:5000/actions', {
    //       headers: {
    //         'Accept': 'application/json'
    //       }
    //     });
    //     const data = await response.json();

    //     const formattedChartData = {
    //       labels: Object.keys(data.dailyNewlyOpenedActions || {}),
    //       datasets: [
    //         {
    //           label: 'Newly Opened Actions',
    //           backgroundColor: 'rgba(75, 192, 192, 0.2)',
    //           borderColor: 'rgba(75, 192, 192, 1)',
    //           borderWidth: 1,
    //           data: Object.values(data.dailyNewlyOpenedActions || {}),
    //         },
    //         {
    //           label: 'Active Actions',
    //           backgroundColor: 'rgba(255, 99, 132, 0.2)',
    //           borderColor: 'rgba(255, 99, 132, 1)',
    //           borderWidth: 1,
    //           data: Object.values(data.dailyActiveActions || {}),
    //         },
    //       ]
    //     };
    //     return formattedChartData
    //   }
    //   catch(error){
    //     console.error('Error fetching data:', error);
    //   }
    // }
    
    async function fetchActiveActionCount() {
      try {
        // Fetch data when authorized
        const response = await fetch('http://localhost:5000/actions', {
          headers: {
            'Accept': 'application/json'
          }
        });
        const data = await response.json();

        setActiveActionCount(data.actionCount);
        setactionTypeCount(data.actionTypeCount); 
      

        console.log(data.dailyNewlyOpenedActions)
        console.log(data.dailyActiveActions)

        const number_of_previous = 14;

        const labels = Object.keys(data.dailyActiveActions).slice(-number_of_previous);
        const formattedChartData = {
          labels: labels,
          datasets: [
            {
              label: 'Newly Opened Actions',
              backgroundColor: 'rgb(19, 59, 85)',
              borderColor: 'rgb(19, 59, 85)',
              borderWidth: 2,
              fill: false,
              data: Object.values(data.dailyNewlyOpenedActions).slice(-number_of_previous),
            },
            {
              label: 'Active Actions',
              backgroundColor: 'rgb(134, 186, 62)',
              borderColor: 'rgb(134, 186, 62)',
              borderWidth: 1,
              data: Object.values(data.dailyActiveActions).slice(-number_of_previous),
            },
          ],
        };

        // const labels = Object.keys(data.dailyActiveActions)
        // const formattedChartData = {
        //   labels,
        //   datasets: [
        //     {
        //       type: 'bar',
        //       label: 'Newly Opened Actions',
        //       backgroundColor: 'rgba(75, 192, 192, 0.2)',
        //       borderColor: 'rgba(75, 192, 192, 1)',
        //       borderWidth: 1,
        //       data: labels.map(() => data.dailyNewlyOpenedActions),
        //     },
        //     // {
        //     //   label: 'Active Actions',
        //     //   backgroundColor: 'rgba(255, 99, 132, 0.2)',
        //     //   borderColor: 'rgba(255, 99, 132, 1)',
        //     //   borderWidth: 1,
        //     //   data: Object.values(data.dailyActiveActions || {}),
        //     // },
        //   ]
        // };
        // console.log(formattedChartData)

        setChartData(formattedChartData)

        const responseTask = await fetch('http://localhost:5000/tasks', { 
          headers: {
            'Accept' : 'application/json'
          }

        });
        const task_data = await responseTask.json();
        
        setTaskCount(task_data.taskFilter);
        // console.log(task_data.taskFilter)
        setTaskAssignee(task_data.participantMap)
        // console.log(task_data.participantMap)
//         console.log("Action count:", actionCount);
// console.log("Task count:", taskCount);
// console.log("Action type count:", actionTypeCount);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setIsLoading(false);
      }
    }

    fetchActiveActionCount();

    // setChartRef(useRef<ChartJS>(null))
  }, []);

  // Render the component
  if (isLoading) {
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
    <div className="container">
      <div class="row">

        <div className="col-sm">
          <h2>Active Matters Count: {actionCount.active}</h2>
        </div>

        <div className="col-sm">
          <h2>Closed Matters Count: {actionCount.closed}</h2>
        </div>

        <div className="col-sm">
          <h2>Incomplete Task Count: {taskCount.incomplete && Object.keys(taskCount.incomplete).length}</h2>
        </div>

        <div className="col-sm">
          <h2>Completed Task Count: {Object.keys(taskCount.complete).length}</h2>
        </div>

        <div className="col-sm">
          <h2>Overdue Task Count: {Object.keys(taskCount.overdue).length}</h2>
        </div>

      </div>

      <div className="count-box-new">
        <h2>Action Type Counts:</h2>
        <table className='bordered-table'>
          <thead>
            <tr>
              <th>Action Type</th>
              <th>Active Matters</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(actionTypeCount)
              .sort(([, a], [, b]) => b - a) // Sort in descending order by value
              .map(([name, value]) => (
                <tr key={name}>
                  <td className='bordered-td'>{name}</td>
                  <td className='bordered-td'>{value}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="count-box-new">
        <h2>Overdue Tasks: </h2>
        <table className='bordered-table'>
          <thead>
            <tr className='bordered-tr'>
            <th>Status</th>
              <th>Name</th>
              <th>Priority</th>
              <th>Description</th>
              <th>Matter ID</th>
              <th>Assignee</th>
              <th>Due Date</th>
            </tr>
          </thead>
          <tbody>
            {taskCount.overdue ? (
              taskCount.overdue.map((task) => (
                <tr key={task.id}>
                  <td className='bordered-td'>{task.status}</td>
                  <td className='bordered-td'>{task.name}</td>
                  <td className='bordered-td'>{task.priority}</td>
                  <td className='bordered-td'>{task.description ? task.description : "None"}</td>
                  <td className='bordered-td'>{task.links.action}</td>
                  <td className='bordered-td'>{participantMap[task.links.assignee].firstName} {participantMap[task.links.assignee].lastName}</td>
                  <td className='bordered-td'>{task.dueTimestamp}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3">No overdue tasks available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="count-box-new">
        <h2>Incomplete Tasks: </h2>
        <table className='bordered-table'>
          <thead>
            <tr className='bordered-tr'>
            <th>Status</th>
              <th>Name</th>
              <th>Priority</th>
              <th>Description</th>
              <th>Matter ID</th>
              <th>Assignee</th>
              <th>Due Date</th>
            </tr>
          </thead>
          <tbody>
            {taskCount.incomplete ? (
              taskCount.incomplete.map((task) => (
                <tr key={task.id}>
                  <td className='bordered-td'>{task.status}</td>
                  <td className='bordered-td'>{task.name}</td>
                  <td className='bordered-td'>{task.priority}</td>
                  <td className='bordered-td'>{task.description ? task.description : "None"}</td>
                  <td className='bordered-td'>{task.links.action}</td>
                  <td className='bordered-td'>{participantMap[task.links.assignee].firstName} {participantMap[task.links.assignee].lastName}</td>
                  <td className='bordered-td'>{task.dueTimestamp}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3">No incomplete tasks available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="chart-container">
      <Bar 
        // ref={chartRef}
        data={chartData}
        options={{
          title:{
            display:true,
            text:'MATTERS',
            fontSize:20
          },
          legend:{
            display:true,
            position:'right'
          }
        }}
      />
    </div>
    </div>
    
  );
}

export default Dashboard;