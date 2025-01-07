import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './Login'; // Adjust the path if your file structure is different
import Sender from './Sender'; // Adjust the path if your file structure is different
import Faculty from './Faculty'; // Adjust the path if your file structure is different
import Admin from './Admin'; // Import the new Admin component
import Tasks from './Tasks'; // Import the new Tasks component

function App() {
    return (
        <Router>
            <div>
                <Routes>
                    <Route path="/" element={<Login />} />  {/* Route for Login */}
                    <Route path="/sender" element={<Sender />} /> {/* Route for Admin dashboard */}
                    <Route path="/faculty" element={<Faculty />} /> {/* Route for Faculty dashboard */}
                    <Route path="/admin" element={<Admin />} /> {/* New Route for Admin */}
                    <Route path="/tasks" element={<Tasks />} /> {/* Updated route for Tasks */}
                </Routes>
            </div>
        </Router>
    );
}

export default App;
