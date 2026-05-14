const express = require('express');
const path = require('path');
const bcrypt = require('bcryptjs');
const { connectDB, getDB } = require('./database');
const { ObjectId } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(__dirname));

// Enable CORS for all routes
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, user-role, user-email');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Database connection
let db;
connectDB().then(database => {
    db = database;
    console.log('📦 Database ready for requests');
}).catch(err => {
    console.error('Failed to connect to database:', err);
    process.exit(1);
});

// ============ API ROUTES ============

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date(), database: db ? 'connected' : 'disconnected' });
});

// SIGNUP
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        
        if (password.length < 4) {
            return res.status(400).json({ error: 'Password must be at least 4 characters' });
        }
        
        // Check if user exists
        const existingUser = await db.collection('users').findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }
        
        // Check if this is the first user (make them admin)
        const userCount = await db.collection('users').countDocuments();
        const role = userCount === 0 ? 'admin' : 'member';
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create user
        const result = await db.collection('users').insertOne({
            name,
            email,
            password: hashedPassword,
            role,
            createdAt: new Date()
        });
        
        console.log(`✅ New user created: ${email} (${role})`);
        
        res.json({
            success: true,
            user: {
                id: result.insertedId,
                name,
                email,
                role
            }
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// LOGIN
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }
        
        const user = await db.collection('users').findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        console.log(`✅ User logged in: ${email}`);
        
        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET all users (for task assignment)
app.get('/api/users', async (req, res) => {
    try {
        const users = await db.collection('users')
            .find({}, { projection: { name: 1, email: 1, role: 1 } })
            .toArray();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// CREATE PROJECT
app.post('/api/projects', async (req, res) => {
    try {
        const { name, description, userRole, userId } = req.body;
        
        if (userRole !== 'admin') {
            return res.status(403).json({ error: 'Only admins can create projects' });
        }
        
        if (!name || name.trim() === '') {
            return res.status(400).json({ error: 'Project name is required' });
        }
        
        const project = {
            name: name.trim(),
            description: description || '',
            createdAt: new Date(),
            createdBy: userId || 'unknown'
        };
        
        const result = await db.collection('projects').insertOne(project);
        
        console.log(`✅ Project created: ${name}`);
        
        res.json({ 
            success: true,
            project: { 
                ...project, 
                id: result.insertedId,
                _id: undefined
            } 
        });
    } catch (error) {
        console.error('Create project error:', error);
        res.status(500).json({ error: 'Failed to create project' });
    }
});

// GET all projects
app.get('/api/projects', async (req, res) => {
    try {
        const projects = await db.collection('projects').find().toArray();
        const formattedProjects = projects.map(p => ({
            id: p._id,
            name: p.name,
            description: p.description,
            createdAt: p.createdAt
        }));
        res.json(formattedProjects);
    } catch (error) {
        console.error('Get projects error:', error);
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});

// DELETE PROJECT
app.delete('/api/projects/:id', async (req, res) => {
    try {
        const userRole = req.headers['user-role'];
        
        if (userRole !== 'admin') {
            return res.status(403).json({ error: 'Only admins can delete projects' });
        }
        
        const projectId = req.params.id;
        
        // Delete the project
        await db.collection('projects').deleteOne({ _id: new ObjectId(projectId) });
        
        // Delete all tasks associated with this project
        await db.collection('tasks').deleteMany({ projectId: projectId });
        
        console.log(`✅ Project deleted: ${projectId}`);
        
        res.json({ success: true });
    } catch (error) {
        console.error('Delete project error:', error);
        res.status(500).json({ error: 'Failed to delete project' });
    }
});

// CREATE TASK
app.post('/api/tasks', async (req, res) => {
    try {
        const { title, projectId, assigneeEmail, dueDate, status } = req.body;
        
        if (!title || title.trim() === '') {
            return res.status(400).json({ error: 'Task title is required' });
        }
        
        if (!projectId) {
            return res.status(400).json({ error: 'Project ID is required' });
        }
        
        // Validate assignee exists
        const assignee = await db.collection('users').findOne({ email: assigneeEmail });
        if (!assignee) {
            return res.status(400).json({ error: 'Assignee user not found. Ask them to sign up first!' });
        }
        
        // Validate project exists
        const project = await db.collection('projects').findOne({ _id: new ObjectId(projectId) });
        if (!project) {
            return res.status(400).json({ error: 'Project not found' });
        }
        
        const task = {
            title: title.trim(),
            projectId: projectId,
            assigneeEmail: assigneeEmail,
            dueDate: dueDate || null,
            status: status || 'pending',
            createdAt: new Date()
        };
        
        const result = await db.collection('tasks').insertOne(task);
        
        console.log(`✅ Task created: ${title} assigned to ${assigneeEmail}`);
        
        res.json({ 
            success: true,
            task: { 
                ...task, 
                id: result.insertedId 
            } 
        });
    } catch (error) {
        console.error('Create task error:', error);
        res.status(500).json({ error: 'Failed to create task' });
    }
});

// GET tasks (with filtering by role)
app.get('/api/tasks', async (req, res) => {
    try {
        const { userRole, userEmail } = req.query;
        let query = {};
        
        if (userRole === 'member') {
            query = { assigneeEmail: userEmail };
        }
        
        const tasks = await db.collection('tasks').find(query).toArray();
        const formattedTasks = tasks.map(t => ({
            id: t._id,
            title: t.title,
            projectId: t.projectId,
            assigneeEmail: t.assigneeEmail,
            dueDate: t.dueDate,
            status: t.status,
            createdAt: t.createdAt
        }));
        
        res.json(formattedTasks);
    } catch (error) {
        console.error('Get tasks error:', error);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});

// UPDATE TASK STATUS
app.put('/api/tasks/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const taskId = req.params.id;
        
        if (!['pending', 'in-progress', 'done'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }
        
        await db.collection('tasks').updateOne(
            { _id: new ObjectId(taskId) },
            { $set: { status, updatedAt: new Date() } }
        );
        
        console.log(`✅ Task status updated: ${taskId} -> ${status}`);
        
        res.json({ success: true });
    } catch (error) {
        console.error('Update task error:', error);
        res.status(500).json({ error: 'Failed to update task' });
    }
});

// GET dashboard stats
app.get('/api/stats/:userEmail', async (req, res) => {
    try {
        const userEmail = req.params.userEmail;
        const user = await db.collection('users').findOne({ email: userEmail });
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        let tasksQuery = {};
        if (user.role === 'member') {
            tasksQuery = { assigneeEmail: userEmail };
        }
        
        const allTasks = await db.collection('tasks').find(tasksQuery).toArray();
        const now = new Date();
        
        const stats = {
            total: allTasks.length,
            pending: allTasks.filter(t => t.status === 'pending').length,
            inProgress: allTasks.filter(t => t.status === 'in-progress').length,
            done: allTasks.filter(t => t.status === 'done').length,
            overdue: allTasks.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'done').length
        };
        
        res.json(stats);
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ error: 'Failed to get stats' });
    }
});

// Serve HTML for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`
    ════════════════════════════════════════
    🚀 TaskFlow Server is Running!
    ════════════════════════════════════════
    📍 Local URL:    http://localhost:${PORT}
    📦 Database:     MongoDB Atlas Connected
    🗄️  Collections:  users, projects, tasks
    ════════════════════════════════════════
    `);
}); 		
