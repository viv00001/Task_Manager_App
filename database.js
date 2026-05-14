const { MongoClient } = require('mongodb');

// Get MongoDB connection string from environment variables
const uri = process.env.MONGODB_URI;

// Check if URI exists - if not, show clear error
if (!uri) {
    console.error('❌ ERROR: MONGODB_URI environment variable is not set!');
    console.error('Please add MONGODB_URI to your Railway environment variables.');
    console.error('Example: MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/taskflow');
    process.exit(1);
}

console.log('✅ MONGODB_URI found, attempting to connect...');

// Create MongoDB client
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

let db;

async function connectDB() {
    try {
        // Connect to MongoDB
        await client.connect();
        console.log('✅ Connected to MongoDB Atlas Successfully!');
        
        // Use 'taskflow' database
        db = client.db('taskflow');
        
        // Get existing collections
        const collections = await db.listCollections().toArray();
        const collectionNames = collections.map(c => c.name);
        
        // Create users collection if it doesn't exist
        if (!collectionNames.includes('users')) {
            await db.createCollection('users');
            console.log('📁 Created "users" collection');
        }
        
        // Create projects collection if it doesn't exist
        if (!collectionNames.includes('projects')) {
            await db.createCollection('projects');
            console.log('📁 Created "projects" collection');
        }
        
        // Create tasks collection if it doesn't exist
        if (!collectionNames.includes('tasks')) {
            await db.createCollection('tasks');
            console.log('📁 Created "tasks" collection');
        }
        
        // Create indexes for better performance
        await db.collection('users').createIndex({ email: 1 }, { unique: true });
        console.log('✅ Created index on users.email');
        
        await db.collection('tasks').createIndex({ projectId: 1 });
        console.log('✅ Created index on tasks.projectId');
        
        await db.collection('tasks').createIndex({ assigneeEmail: 1 });
        console.log('✅ Created index on tasks.assigneeEmail');
        
        console.log('🎉 Database setup complete and ready!');
        return db;
        
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        console.error('Please check:');
        console.error('1. Your MongoDB Atlas username and password are correct');
        console.error('2. Your IP address is whitelisted (0.0.0.0/0)');
        console.error('3. Your connection string is correct');
        throw error;
    }
}

function getDB() {
    if (!db) {
        throw new Error('Database not connected! Call connectDB() first.');
    }
    return db;
}

// Close database connection (for graceful shutdown)
async function closeDB() {
    try {
        await client.close();
        console.log('📴 Database connection closed');
    } catch (error) {
        console.error('Error closing database:', error);
    }
}

module.exports = { connectDB, getDB, closeDB };
