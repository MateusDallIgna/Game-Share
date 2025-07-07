require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const setupDatabase = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/game-share');
    console.log('✅ Connected to MongoDB');

    // Check if admin user exists
    const adminExists = await User.findOne({ email: 'admin@gameshare.com' });
    
    if (adminExists) {
      console.log('👤 Admin user already exists');
    } else {
      console.log('👤 Creating admin user...');
      
      // Create admin user
      const adminUser = new User({
        name: 'Admin',
        email: 'admin@gameshare.com',
        password: 'admin123',
        role: 'admin',
        isVerified: true
      });

      await adminUser.save();
      console.log('✅ Admin user created successfully');
      console.log('📧 Email: admin@gameshare.com');
      console.log('🔑 Password: admin123');
    }

    // Create some sample users
    const sampleUsers = [
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        isVerified: true
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'password123',
        isVerified: true
      }
    ];

    for (const userData of sampleUsers) {
      const userExists = await User.findOne({ email: userData.email });
      if (!userExists) {
        const user = new User(userData);
        await user.save();
        console.log(`✅ Created user: ${userData.name} (${userData.email})`);
      }
    }

    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Start the backend server: npm run dev');
    console.log('2. Start the frontend: cd ../frontend && npm start');
    console.log('3. Access the application at: http://localhost:3000');
    console.log('\n🔐 Admin credentials:');
    console.log('   Email: admin@gameshare.com');
    console.log('   Password: admin123');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run setup if this file is executed directly
if (require.main === module) {
  setupDatabase();
}

module.exports = setupDatabase; 