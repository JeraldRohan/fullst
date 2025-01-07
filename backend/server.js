const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection string
const CONNECTION_STRING = 'mongodb://localhost:27017/users';

// Connect to MongoDB
mongoose.connect(CONNECTION_STRING)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));

// User schema
const userSchema = new mongoose.Schema({
    id: String,
    name: String,
    email: String,
    department: String,
    password: String,
    task: String,
    sender: String,
    status: { type: Boolean, default: false },
    role: { type: String, enum: ['user', 'sender', 'admin'], default: 'user' }
});

const User = mongoose.model('User', userSchema);

// Task schema
const taskSchema = new mongoose.Schema({
    userId: String, // Reference to the user's ID
    name: String,
    email: String,
    department: String,
    task: String,
    sender: String,
    status: { type: String, enum: ['approved', 'rejected', 'pending'], default: 'pending' }, // Status can be approved, rejected, or pending
    createdAt: { type: Date, default: Date.now } // Timestamp for when the task was created
});

const Task = mongoose.model('Task', taskSchema);

// Endpoint to get all users
app.get('/users', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        res.status(500).send(err);
    }
});

// Endpoint to get a single user by ID
app.get('/users/:id', async (req, res) => {
    try {
        const user = await User.findOne({ id: req.params.id });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching user data' });
    }
});

// Endpoint to update task and sender for multiple users
app.post('/users/update-task', async (req, res) => {
    const { userIds, task, sender } = req.body;

    try {
        // Update users in the User collection
        await User.updateMany(
            { id: { $in: userIds } },
            { $set: { task: task, sender: sender, status: false } }
        );

        // Log each task in the Task collection
        const users = await User.find({ id: { $in: userIds } });
        const tasksToLog = users.map(user => ({
            userId: user.id,
            name: user.name,
            email: user.email,
            department: user.department,
            task: task,
            sender: sender,
            status: 'pending' // Initial status as pending
        }));

        await Task.insertMany(tasksToLog); // Insert tasks into Task collection
        res.status(200).json({ message: 'Task and sender updated successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update tasks and sender' });
    }
});

// Endpoint to update task for a single user
app.post('/users/update-task/:id', async (req, res) => {
    const { id } = req.params;
    const { task, sender } = req.body;

    try {
        await User.updateOne({ id: id }, { $set: { task: task, sender: sender, status: false } });

        // Log the task in the Task collection
        const user = await User.findOne({ id: id });
        const newTask = new Task({
            userId: user.id,
            name: user.name,
            email: user.email,
            department: user.department,
            task: task,
            sender: sender,
            status: 'pending'
        });

        await newTask.save(); // Save new task
        res.status(200).json({ message: 'Task and sender updated successfully for user' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update task and sender for user' });
    }
});

// Endpoint to approve a task
app.post('/users/approve/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Approve task in User collection
        await User.updateOne({ id: id }, { $set: { status: true } });
        
        // Log approval in Task collection
        await Task.updateOne({ userId: id, status: 'pending' }, { $set: { status: 'approved' } });
        
        res.status(200).json({ message: 'Task approved successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to approve task' });
    }
});

// Endpoint to reject a task
app.post('/users/reject/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Reject task in User collection
        await User.updateOne({ id: id }, { $set: { task: "", sender: "", status: false } });
        
        // Log rejection in Task collection
        await Task.updateOne({ userId: id, status: 'pending' }, { $set: { status: 'rejected' } });
        
        res.status(200).json({ message: 'Task rejected successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to reject task' });
    }
});

// Endpoint to get all tasks (approved, rejected, and pending)
app.get('/tasks', async (req, res) => {
    try {
        const tasks = await Task.find(); // Fetch all tasks, regardless of their status
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching tasks' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
