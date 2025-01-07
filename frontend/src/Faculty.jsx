import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Faculty.css';

const Faculty = () => {
    const [faculty, setFaculty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchFaculty = async () => {
            const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
            
            if (!loggedInUser) {
                setError('No user logged in');
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get(`http://localhost:5000/users/${loggedInUser.id}`);
                setFaculty(response.data);
                setLoading(false);
            } catch (err) {
                setError('Error fetching user data');
                setLoading(false);
            }
        };

        fetchFaculty();
    }, []);

    const handleCompleteTask = async () => {
        const confirmTaskCompletion = window.confirm('Task done?');
        
        if (confirmTaskCompletion) {
            try {
                await axios.post(`http://localhost:5000/users/update-task/${faculty.id}`, {
                    task: "",  // Clear task on completion
                    sender: "" // Clear sender on completion
                });
                
                setFaculty((prevFaculty) => ({ ...prevFaculty, task: "", sender: "" }));
                alert('Task marked as complete!');
            } catch (err) {
                setError('Failed to update task');
            }
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('loggedInUser');
        window.location.reload(); // Refresh the page to reflect logged-out state
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <>
            <nav className="navbar">
                <h2 className="navbar-title">{faculty.name}'s Taskbook</h2>
                <button className="logout-button" onClick={handleLogout}>Logout</button>
            </nav>
            <div className="faculty-dashboard">
                {faculty ? (
                    <div className="faculty-content">
                        {/* Left side: Faculty details */}
                        <div className="faculty-details">
                            <div className="section-header">
                                <h3>Faculty Details</h3>
                            </div>
                            <div className="cont">
                            <p><strong>ID:</strong> {faculty.id}</p>
                            <p><strong>Name:</strong> {faculty.name}</p>
                            <p><strong>Email:</strong> {faculty.email}</p>
                            <p><strong>Department:</strong> {faculty.department}</p>
                            </div>
                        </div>

                        {/* Right side: Task details */}
                        <div className="faculty-task">
                            <div className="section-header">
                                <h3>Task Details</h3>
                            </div>
                            <div className='cont'>
                            {faculty.status && faculty.task ? (
                                <>
                                    <p><strong>Task:</strong> {faculty.task}</p>
                                    <p><strong>Sender:</strong> {faculty.sender || 'N/A'}</p>
                                    <button onClick={handleCompleteTask}>Complete Task</button>
                                </>
                            ) : (
                                <p>No task assigned or awaiting approval</p>
                            )}
                         </div>
                        </div>
                    </div>
                ) : (
                    <p>No faculty details available.</p>
                )}
            </div>
        </>
    );
};

export default Faculty;