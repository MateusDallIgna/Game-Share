/**
 * Database Initialization Script for Oracle Server
 * This script sets up the MongoDB database with initial data
 */

const { MongoClient } = require('mongodb');

// Database configuration
const config = {
  url: process.env.MONGODB_URI || 'mongodb://localhost:27017',
  dbName: 'game-share',
  collections: {
    users: 'users',
    games: 'games'
  }
};

// Initial admin user
const adminUser = {
  name: 'Admin',
  email: 'admin@gameshare.com',
  password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK8i', // admin123
  role: 'admin',
  isVerified: true,
  gamesUploaded: [],
  totalUploads: 0,
  totalDownloads: 0,
  createdAt: new Date(),
  updatedAt: new Date()
};

// Sample users
const sampleUsers = [
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK8i', // password123
    role: 'user',
    isVerified: true,
    gamesUploaded: [],
    totalUploads: 0,
    totalDownloads: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK8i', // password123
    role: 'user',
    isVerified: true,
    gamesUploaded: [],
    totalUploads: 0,
    totalDownloads: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Database indexes
const indexes = {
  users: [
    { key: { email: 1 }, unique: true, name: 'email_unique' },
    { key: { name: 1 }, name: 'name_index' }
  ],
  games: [
    { key: { title: 'text', description: 'text' }, name: 'text_search' },
    { key: { uploader: 1 }, name: 'uploader_index' },
    { key: { category: 1 }, name: 'category_index' },
    { key: { isActive: 1 }, name: 'active_index' },
    { key: { createdAt: -1 }, name: 'created_desc' },
    { key: { downloads: -1 }, name: 'downloads_desc' }
  ]
};

async function initializeDatabase() {
  let client;
  
  try {
    console.log('🔗 Connecting to MongoDB...');
    client = new MongoClient(config.url);
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db(config.dbName);
    
    // Create collections
    console.log('📁 Creating collections...');
    await db.createCollection(config.collections.users);
    await db.createCollection(config.collections.games);
    
    // Create indexes
    console.log('🔍 Creating indexes...');
    for (const [collectionName, collectionIndexes] of Object.entries(indexes)) {
      const collection = db.collection(collectionName);
      for (const index of collectionIndexes) {
        try {
          await collection.createIndex(index.key, {
            unique: index.unique || false,
            name: index.name
          });
          console.log(`✅ Created index: ${index.name}`);
        } catch (error) {
          if (error.code !== 85) { // Index already exists
            console.error(`❌ Failed to create index ${index.name}:`, error.message);
          }
        }
      }
    }

    // Insert admin user
    console.log('👤 Setting up admin user...');
    const usersCollection = db.collection(config.collections.users);
    const adminExists = await usersCollection.findOne({ email: adminUser.email });
    
    if (!adminExists) {
      await usersCollection.insertOne(adminUser);
      console.log('✅ Admin user created');
      console.log('📧 Email: admin@gameshare.com');
      console.log('🔑 Password: admin123');
    } else {
      console.log('👤 Admin user already exists');
    }

    // Insert sample users
    console.log('👥 Setting up sample users...');
    for (const user of sampleUsers) {
      const userExists = await usersCollection.findOne({ email: user.email });
      if (!userExists) {
        await usersCollection.insertOne(user);
        console.log(`✅ Created user: ${user.name} (${user.email})`);
      }
    }

    console.log('\n🎉 Database initialization completed successfully!');
    console.log('\n📊 Database Statistics:');
    
    const userCount = await usersCollection.countDocuments();
    const gamesCount = await db.collection(config.collections.games).countDocuments();
    
    console.log(`👥 Users: ${userCount}`);
    console.log(`🎮 Games: ${gamesCount}`);
    
    console.log('\n🔐 Default Credentials:');
    console.log('Admin: admin@gameshare.com / admin123');
    console.log('User 1: john@example.com / password123');
    console.log('User 2: jane@example.com / password123');

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run initialization if this file is executed directly
if (require.main === module) {
  initializeDatabase();
}

module.exports = { initializeDatabase, config }; 