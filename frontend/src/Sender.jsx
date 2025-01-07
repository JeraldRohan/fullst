import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Sender.css';

const Sender = () => {
    const [facultyData, setFacultyData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedFaculties, setSelectedFaculties] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFacultyData = async () => {
            try {
                const response = await axios.get('http://localhost:5000/users');
                const data = response.data;

                const departments = data.reduce((acc, user) => {
                    if (user.department) {
                        if (!acc[user.department]) {
                            acc[user.department] = [];
                        }
                        acc[user.department].push(user);
                    }
                    return acc;
                }, {});

                setFacultyData(departments);
                setSelectedFaculties(
                    Object.keys(departments).reduce((acc, department) => {
                        acc[department] = departments[department].map((faculty) => ({
                            id: faculty.id,
                            selected: false,
                        }));
                        return acc;
                    }, {})
                );
            } catch (err) {
                setError('Error fetching faculty data');
            } finally {
                setLoading(false);
            }
        };

        fetchFacultyData();
    }, []);

    const handleCheckboxChange = (department, facultyId) => {
        setSelectedFaculties((prevSelected) => ({
            ...prevSelected,
            [department]: prevSelected[department].map((faculty) =>
                faculty.id === facultyId ? { ...faculty, selected: !faculty.selected } : faculty
            ),
        }));
    };

    const handleSelectAllChange = (department) => {
        const allSelected = selectedFaculties[department].every((faculty) => faculty.selected);
        setSelectedFaculties((prevSelected) => ({
            ...prevSelected,
            [department]: prevSelected[department].map((faculty) => ({
                ...faculty,
                selected: !allSelected,
            })),
        }));
    };

    const isAnyFacultySelected = () => {
        return Object.values(selectedFaculties).some((department) =>
            department.some((faculty) => faculty.selected)
        );
    };

    const handleAddTask = async () => {
        if (!isAnyFacultySelected()) {
            alert('Please select at least one faculty member to add a task.');
            return;
        }

        const task = prompt('Enter the task:');
        if (!task) return;

        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
        const sender = loggedInUser?.email;

        if (!sender) {
            alert('Error: Could not retrieve sender information.');
            return;
        }

        const selectedIds = [];
        Object.values(selectedFaculties).forEach((department) =>
            department.forEach((faculty) => {
                if (faculty.selected) selectedIds.push(faculty.id);
            })
        );

        try {
            await axios.post('http://localhost:5000/users/update-task', {
                userIds: selectedIds,
                task,
                sender,
            });

            setFacultyData((prevData) => {
                const updatedData = { ...prevData };
                Object.keys(updatedData).forEach((department) => {
                    updatedData[department] = updatedData[department].map((faculty) =>
                        selectedIds.includes(faculty.id)
                            ? { ...faculty, task, sender, status: false }
                            : faculty
                    );
                });
                return updatedData;
            });

            setSelectedFaculties((prevSelected) => {
                const updatedSelections = {};
                Object.keys(prevSelected).forEach((department) => {
                    updatedSelections[department] = prevSelected[department].map((faculty) => ({
                        ...faculty,
                        selected: false,
                    }));
                });
                return updatedSelections;
            });

            alert(`Task "${task}" added successfully!`);
        } catch (err) {
            alert('Error updating task');
        }
    };

    const handleApprovedTasks = () => {
        navigate('/tasks');
    };

    const handleLogout = () => {
        // Clear user session data
        localStorage.removeItem('loggedInUser');
        navigate('/'); // Navigate to login page
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <>
            <nav className="navbar-sender">
                <h2 className="navbar-title-sender">Task Allocation</h2>
                <div className="navbar-buttons-sender">
                    <button className="add-task-button" onClick={handleAddTask}>
                        Add Task
                    </button>
                    <button className="approved-tasks-button" onClick={handleApprovedTasks}>
                        Task History
                    </button>
                    <button className="logout-button" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </nav>

            <div className='faculty-list-container'>
                {Object.entries(facultyData).map(([department, faculties]) => (
                    <div key={department}>
                        <h3>{department} Department</h3>
                        <table className="faculty-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>
                                        <input 
                                            type="checkbox"
                                            onChange={() => handleSelectAllChange(department)}
                                            checked={selectedFaculties[department].every((faculty) => faculty.selected)}
                                            id={`select-all-${department}`}
                                        />
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {faculties.map((faculty) => (
                                    <tr key={faculty.id}>
                                        <td>{faculty.id}</td>
                                        <td>{faculty.name}</td>
                                        <td>{faculty.email}</td>
                                        <td>
                                            <input
                                                type="checkbox"
                                                onChange={() => handleCheckboxChange(department, faculty.id)}
                                                checked={selectedFaculties[department].find((f) => f.id === faculty.id)?.selected}
                                                className="faculty-checkbox"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))}
            </div>
        </>
    );
};

export default Sender;
