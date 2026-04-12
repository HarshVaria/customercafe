const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const MenuItem = require('../models/Menu');
const Order = require('../models/Order');

// Load env vars
dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.log('❌ Error:', err));

// Sample Users
const users = [
  {
    username: 'owner',
    password: 'owner123',
    role: 'owner',
    cafeName: 'Brew & Bites Cafe'
  },
  {
    username: 'kitchen',
    password: 'kitchen123',
    role: 'kitchen',
    cafeName: 'Brew & Bites Cafe'
  }
];

// Sample Menu Items
const menuItems = [
  // Beverages
  {
    name: 'Cappuccino',
    description: 'Rich espresso with steamed milk foam',
    price: 120,
    category: 'Beverages',
    image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400',
    available: true,
    preparationTime: 5
  },
  {
    name: 'Cold Coffee',
    description: 'Chilled coffee with ice cream',
    price: 150,
    category: 'Beverages',
    image: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400',
    available: true,
    preparationTime: 5
  },
  {
    name: 'Masala Chai',
    description: 'Traditional Indian spiced tea',
    price: 40,
    category: 'Beverages',
    image: 'https://images.unsplash.com/photo-1597318236537-6be33a3d46fe?w=400',
    available: true,
    preparationTime: 5
  },
  {
    name: 'Fresh Lime Soda',
    description: 'Refreshing lime juice with soda',
    price: 60,
    category: 'Beverages',
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400',
    available: true,
    preparationTime: 3
  },
  {
    name: 'Mango Smoothie',
    description: 'Thick mango smoothie with yogurt',
    price: 140,
    category: 'Beverages',
    image: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=400',
    available: true,
    preparationTime: 5
  },

  // Snacks
  {
    name: 'Veg Sandwich',
    description: 'Grilled sandwich with fresh vegetables',
    price: 80,
    category: 'Snacks',
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400',
    available: true,
    preparationTime: 10
  },
  {
    name: 'French Fries',
    description: 'Crispy golden fries with ketchup',
    price: 100,
    category: 'Snacks',
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400',
    available: true,
    preparationTime: 8
  },
  {
    name: 'Samosa (2 pcs)',
    description: 'Crispy pastry filled with spiced potatoes',
    price: 40,
    category: 'Snacks',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400',
    available: true,
    preparationTime: 5
  },
  {
    name: 'Paneer Pakora',
    description: 'Deep fried cottage cheese fritters',
    price: 120,
    category: 'Snacks',
    image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400',
    available: true,
    preparationTime: 12
  },

  // Main Course
  {
    name: 'Paneer Butter Masala',
    description: 'Cottage cheese in rich tomato gravy with 2 butter naan',
    price: 240,
    category: 'Main Course',
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400',
    available: true,
    preparationTime: 20
  },
  {
    name: 'Dal Tadka with Rice',
    description: 'Yellow lentils with aromatic tempering',
    price: 180,
    category: 'Main Course',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400',
    available: true,
    preparationTime: 15
  },
  {
    name: 'Veg Biryani',
    description: 'Fragrant basmati rice with mixed vegetables',
    price: 200,
    category: 'Main Course',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400',
    available: true,
    preparationTime: 25
  },
  {
    name: 'Chole Bhature',
    description: 'Spicy chickpeas with fluffy fried bread',
    price: 150,
    category: 'Main Course',
    image: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=400',
    available: true,
    preparationTime: 18
  },

  // Breakfast
  {
    name: 'Aloo Paratha',
    description: 'Stuffed potato flatbread with curd and pickle',
    price: 80,
    category: 'Breakfast',
    image: 'https://images.unsplash.com/photo-1589301773859-34a6b3d7f3f0?w=400',
    available: true,
    preparationTime: 15
  },
  {
    name: 'Poha',
    description: 'Flattened rice with peanuts and spices',
    price: 60,
    category: 'Breakfast',
    image: 'https://images.unsplash.com/photo-1626019188044-a3f8f65e8dc7?w=400',
    available: true,
    preparationTime: 10
  },
  {
    name: 'Idli Sambar (4 pcs)',
    description: 'Steamed rice cakes with lentil soup',
    price: 80,
    category: 'Breakfast',
    image: 'https://images.unsplash.com/photo-1630383249896-424e482df921?w=400',
    available: true,
    preparationTime: 12
  },

  // Desserts
  {
    name: 'Gulab Jamun (2 pcs)',
    description: 'Deep fried milk balls in sugar syrup',
    price: 60,
    category: 'Desserts',
    image: 'https://images.unsplash.com/photo-1609501676725-7186f017a4b7?w=400',
    available: true,
    preparationTime: 5
  },
  {
    name: 'Ice Cream (1 scoop)',
    description: 'Choice of vanilla, chocolate, or strawberry',
    price: 50,
    category: 'Desserts',
    image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400',
    available: true,
    preparationTime: 3
  },
  {
    name: 'Brownie with Ice Cream',
    description: 'Warm chocolate brownie with vanilla ice cream',
    price: 120,
    category: 'Desserts',
    image: 'https://images.unsplash.com/photo-1564355808853-6f280adfb4c2?w=400',
    available: true,
    preparationTime: 8
  }
];

// Import data
// Import data
const importData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await MenuItem.deleteMany();
    await Order.deleteMany();
    
    console.log('🗑️  Data Destroyed...');

    // Insert users ONE BY ONE using .create() to trigger pre-save hook
    for (const userData of users) {
      await User.create(userData);
    }
    console.log('👥 Users imported...');

    // Menu items don't need password hashing
    await MenuItem.insertMany(menuItems);
    console.log('🍔 Menu items imported...');

    console.log('✅ Data Imported Successfully!');
    console.log('\n📝 Default Login Credentials:');
    console.log('   Owner  -> username: owner, password: owner123');
    console.log('   Kitchen -> username: kitchen, password: kitchen123');
    
    process.exit();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

// Delete data
const deleteData = async () => {
  try {
    await User.deleteMany();
    await MenuItem.deleteMany();
    await Order.deleteMany();
    
    console.log('🗑️  Data Destroyed Successfully!');
    process.exit();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

// Check command line arguments
if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
} else {
  console.log('Please use: npm run seed (to import) or node src/utils/seeder.js -d (to delete)');
  process.exit();
}