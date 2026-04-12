const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
    console.log('❌ Connection failed:', err);
    process.exit(1);
  });

const createUsers = async () => {
  try {
    // Simple user schema without hooks
    const UserSchema = new mongoose.Schema({
      username: String,
      password: String,
      role: String,
      cafeName: String
    });

    const User = mongoose.model('TestUser', UserSchema);

    // Clear existing
    await User.deleteMany({});
    console.log('🗑️  Cleared existing users');

    // Create owner with manually hashed password
    const ownerHash = await bcrypt.hash('owner123', 10);
    await User.create({
      username: 'owner',
      password: ownerHash,
      role: 'owner',
      cafeName: 'Brew & Bites Cafe'
    });
    console.log('✅ Created owner');

    // Create kitchen with manually hashed password
    const kitchenHash = await bcrypt.hash('kitchen123', 10);
    await User.create({
      username: 'kitchen',
      password: kitchenHash,
      role: 'kitchen',
      cafeName: 'Brew & Bites Cafe'
    });
    console.log('✅ Created kitchen');

    // Verify
    const owner = await User.findOne({ username: 'owner' });
    const testMatch = await bcrypt.compare('owner123', owner.password);
    console.log('\n🧪 Password verification test:', testMatch ? '✅ PASS' : '❌ FAIL');

    if (testMatch) {
      console.log('\n✅ Users created successfully!');
      console.log('Username: owner, Password: owner123');
      console.log('Username: kitchen, Password: kitchen123');
    } else {
      console.log('\n❌ Password verification failed!');
    }

    process.exit(0);
  } catch (error) {
    console.log('❌ Error:', error);
    process.exit(1);
  }
};

createUsers();