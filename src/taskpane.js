import React from 'react';
import { Link } from 'react-router-dom';
import './css/taskpane.css'; 
import logo from './assets/images/logo.png';

const TaskPane = () => {
    return (
        <div className="taskpane-container">
            <img src={logo} alt="Logo" className="logo" />

            <div className="link-container">
                <Link to='/dashboard'><span role="img" aria-label="dashboard-icon">📊</span> Dashboard</Link>
                <Link to='/matters'><span role="img" aria-label="matters-icon">📋</span> Matters</Link>
                <Link to='/pipeline'><span role="img" aria-label="pipeline-icon">🔧</span> Matter Pipeline</Link>
                
                <Link to='/Tasks'><span role="img" aria-label="tasks-icon">📝</span> Tasks</Link>
                <Link to='/TaskPipeline'><span role="img" aria-label="task-pipeline-icon">🔄</span> Task Pipeline</Link>
                <Link to='/admin'><span role="img" aria-label="admin-icon">👤</span> Admin</Link>

            </div>
        </div>
    );
}

export default TaskPane;
