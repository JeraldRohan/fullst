import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Admin.css';

const Admin = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get('http://localhost:5000/users');
                setUsers(response.data);
            } catch (err) {
                setError('Error fetching users');
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const handleApprove = async (id) => {
        try {
            await axios.post(`http://localhost:5000/users/approve/${id}`);
            setUsers((prevUsers) =>
                prevUsers.map(user => user.id === id ? { ...user, status: true } : user)
            );
            alert('Task approved successfully');
        } catch (err) {
            alert('Error approving task');
        }
    };

    const handleReject = async (id) => {
        try {
            await axios.post(`http://localhost:5000/users/reject/${id}`);
            setUsers((prevUsers) =>
                prevUsers.map(user => user.id === id ? { ...user, task: '', sender: '', status: false } : user)
            );
            alert('Task rejected successfully');
        } catch (err) {
            alert('Error rejecting task');
        }
    };

    const handleLogout = () => {
        alert('Logged out successfully!');
        window.location.href = '/'; // Redirect to login page after logout
    };

    const getPriority = (sender) => {
        switch (sender) {
            case 'coe@gmail.com':
                return 1;
            case 'headacademics':
                return 2;
            case 'hodgmails':
                return 3;
            default:
                return 'N/A';
        }
    };

    if (loading) {
        return <p className="loading">Loading...</p>;
    }

    if (error) {
        return <p className="error">{error}</p>;
    }

    return (
        <div className="admin-container">
            {/* Navigation Bar */}
            <div className="navbar-sender">
                <h3 className="navbar-title-sender">Admin Dashboard</h3>
                <div className="navbar-buttons-sender">
                    <button className="logout-button" onClick={handleLogout}>Logout</button>
                </div>
            </div>

            {/* Table with Users */}
            <div className="container">
                <table className="faculties-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Sender</th>
                            <th>Task</th>
                            <th>Status</th>
                            <th>Priority</th>
                            <th>Ongoing task</th>
                            <th>Priority</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users
                            .filter(user => user.task && user.task.trim() !== '')
                            .map(user => (
                                <tr key={user.id}>
                                    <td>{user.id}</td>
                                    <td>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>{user.sender || 'N/A'}</td>
                                    <td>{user.task || 'No task assigned'}</td>
                                    <td>{user.status ? 'Approved' : 'Pending'}</td>
                                    <td>{getPriority(user.sender)}</td>
                                    <td>No ongoing tasks</td>
                                    <td>N/A</td>
                                    <td>
                                        <button className="approve" onClick={() => handleApprove(user.id)}>Approve</button>
                                        <button className="reject" onClick={() => handleReject(user.id)}>Reject</button>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Admin;