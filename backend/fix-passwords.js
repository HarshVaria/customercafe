const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.log('❌ Error:', err));

const fixPasswords = async () => {
  try {
    // User model without hooks (we'll use the existing one)
    const User = mongoose.model('User');
    
    // Get all users
    const users = await User.find();
    console.log(`Found ${users.length} users to fix`);
    
    // Hash and update each user's password
    for (let user of users) {
      console.log(`\nFixing user: ${user.username}`);
      console.log(`Current password: ${user.password}`);
      
      // Hash the password
      const hashedPassword = await bcrypt.hash(user.password, 10);
      console.log(`Hashed password: ${hashedPassword}`);
      
      // Update the user with hashed password
      user.password = hashedPassword;
      await user.save();
      
      console.log(`✅ ${user.username} password fixed`);
    }
    
    console.log('\n✅ All passwords fixed!');
    console.log('\nNow test login with:');
    console.log('Username: owner, Password: owner123');
    console.log('Username: kitchen, Password: kitchen123');
    
    process.exit(0);
  } catch (error) {
    console.log('❌ Error:', error);
    process.exit(1);
  }
};

fixPasswords();