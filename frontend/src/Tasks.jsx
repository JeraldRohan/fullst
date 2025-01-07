import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Tasks.css'; // Importing CSS file for styles

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loggedInUser, setLoggedInUser] = useState(null);

  // Fetch tasks on component mount
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    setLoggedInUser(user);

    // If user is logged in, fetch tasks for that user
    if (user) {
      axios.get('http://localhost:5000/tasks')
        .then(response => {
          // Filter tasks based on logged-in user's email
          const userTasks = response.data.filter(task => task.sender === user.email);
          setTasks(userTasks); // Store filtered tasks in state
        })
        .catch(error => {
          console.error('There was an error fetching the tasks!', error);
        });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    window.location.href = '/'; // Redirect to login page after logout
  };

  const handleGoBack = () => {
    window.history.back(); // Go back to the previous page
  };

  if (!loggedInUser) {
    return <p>Please log in to view your tasks.</p>;
  }

  return (
    <div className="tasks-container">
      {/* Navigation Bar */}
      <div className="navbar">
        <h3 className="navbar-title">Task Management</h3>
        <div className="navbar-buttons">
          <button className="logout-button" onClick={handleLogout}>Logout</button>
          <button className="go-back-button" onClick={handleGoBack}>Go Back</button>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="tasks-content">

        {/* If no tasks exist, show message */}
        {tasks.length === 0 ? (
          <p>No tasks to display</p>
        ) : (
          <table className="tasks-table">
            <thead>
              <tr>
                <th>Task ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Task</th>
                <th>Sender</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map(task => (
                <tr key={task._id}>
                  <td>{task._id}</td>
                  <td>{task.name}</td>
                  <td>{task.email}</td>
                  <td>{task.department}</td>
                  <td>{task.task}</td>
                  <td>{task.sender}</td>
                  <td>
                    <span className={`task-status ${task.status}`}>
                      {task.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Tasks;
