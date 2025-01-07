// Login.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import boxLogo from './assets/boxlogo.png';


const Login = () => {
    const [users, setUsers] = useState([]);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

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

    const handleLogin = (e) => {
        e.preventDefault();

        // Find the user based on the provided email and password
        const matchedUser = users.find(user => user.email === email && user.password === password);

        if (matchedUser) {
            localStorage.setItem('loggedInUser', JSON.stringify(matchedUser));

            // Redirect based on the role of the user
            switch (matchedUser.role) {
                case 'admin':
                    alert('Welcome Admin!');
                    navigate('/admin');
                    break;
                case 'sender':
                    alert('Welcome Task Allocator!');
                    navigate('/sender');
                    break;
                case 'user':
                    alert(`Welcome, ${matchedUser.name}!`);
                    navigate('/faculty');
                    break;
                default:
                    alert('Unauthorized role!');
            }
        } else {
            alert('Invalid email or password!');
        }

        setEmail('');
        setPassword('');
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <>
        <div className="login-container">

            <form onSubmit={handleLogin} className="login-form" autoComplete="on">
            <img src={boxLogo} alt="Logo" />
                <div className="input-group">
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                        placeholder='Enter Email'
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="password">Password:</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                        placeholder='Enter Password'

                    />
                </div>
                <div className="btn">
                    <button type="submit">Sign In</button>
                </div>
                {error && <p className="error">{error}</p>}
            </form>
        </div>
        </>
    );
};

export default Login;
