const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

let db;

async function connectDB() {
    try {
        await client.connect();
        db = client.db('taskflow');
        console.log('✅ Connected to MongoDB Atlas Successfully!');
        
        // Create collections if they don't exist
        const collections = await db.listCollections().toArray();
        const collectionNames = collections.map(c => c.name);
        
        if (!collectionNames.includes('users')) {
            await db.createCollection('users');
            console.log('📁 Created users collection');
        }
        if (!collectionNames.includes('projects')) {
            await db.createCollection('projects');
            console.log('📁 Created projects collection');
        }
        if (!collectionNames.includes('tasks')) {
            await db.createCollection('tasks');
            console.log('📁 Created tasks collection');
        }
        
        // Create indexes for better performance
        await db.collection('users').createIndex({ email: 1 }, { unique: true });
        await db.collection('tasks').createIndex({ projectId: 1 });
        await db.collection('tasks').createIndex({ assigneeEmail: 1 });
        
        console.log('✅ Database setup complete!');
        return db;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        throw error;
    }
}

function getDB() {
    if (!db) {
        throw new Error('Database not connected! Call connectDB first.');
    }
    return db;
}

module.exports = { connectDB, getDB };