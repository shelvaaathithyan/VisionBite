import mongoose from 'mongoose';
import dotenv from 'dotenv';
import FoodItem from './models/FoodItem.js';

dotenv.config();

const sampleFoodItems = [
  // Comfort food for sad mood
  {
    name: 'Classic Mac & Cheese',
    category: 'main',
    description: 'Creamy comfort food that warms the soul',
    price: 12.99,
    isVegetarian: true,
    spicyLevel: 0,
    moodTags: ['sad', 'comfort', 'relaxing'],
  },
  {
    name: 'Chocolate Lava Cake',
    category: 'dessert',
    description: 'Rich chocolate cake with molten center',
    price: 8.99,
    isVegetarian: true,
    spicyLevel: 0,
    moodTags: ['sad', 'happy', 'comfort'],
  },
  
  // Energetic food for happy/energetic mood
  {
    name: 'Spicy Thai Basil Chicken',
    category: 'main',
    description: 'Vibrant and flavorful stir-fry',
    price: 14.99,
    spicyLevel: 4,
    moodTags: ['happy', 'energetic'],
  },
  {
    name: 'Fresh Fruit Smoothie Bowl',
    category: 'appetizer',
    description: 'Refreshing blend of seasonal fruits',
    price: 9.99,
    isVegetarian: true,
    isVegan: true,
    moodTags: ['happy', 'energetic', 'relaxing'],
  },
  
  // Neutral/Classic options
  {
    name: 'Grilled Chicken Caesar Salad',
    category: 'main',
    description: 'Classic caesar with grilled chicken',
    price: 13.99,
    spicyLevel: 0,
    moodTags: ['neutral', 'relaxing'],
  },
  {
    name: 'Margherita Pizza',
    category: 'main',
    description: 'Traditional Italian pizza with fresh basil',
    price: 15.99,
    isVegetarian: true,
    spicyLevel: 0,
    moodTags: ['neutral', 'happy', 'comfort'],
  },
  
  // Comfort beverages
  {
    name: 'Hot Chocolate',
    category: 'beverage',
    description: 'Rich and creamy hot chocolate',
    price: 4.99,
    isVegetarian: true,
    moodTags: ['sad', 'comfort', 'relaxing'],
  },
  {
    name: 'Fresh Lemonade',
    category: 'beverage',
    description: 'Refreshing homemade lemonade',
    price: 3.99,
    isVegetarian: true,
    isVegan: true,
    moodTags: ['happy', 'energetic'],
  },
  
  // Spicy for angry/energetic
  {
    name: 'Buffalo Wings',
    category: 'appetizer',
    description: 'Spicy chicken wings with blue cheese',
    price: 11.99,
    spicyLevel: 5,
    moodTags: ['angry', 'energetic'],
  },
  
  // Surprise element
  {
    name: 'Chef\'s Special Sushi Platter',
    category: 'special',
    description: 'Assorted fresh sushi and sashimi',
    price: 24.99,
    moodTags: ['surprised', 'happy'],
  },
  
  // Vegan options
  {
    name: 'Quinoa Buddha Bowl',
    category: 'main',
    description: 'Nutritious bowl with quinoa and veggies',
    price: 12.99,
    isVegetarian: true,
    isVegan: true,
    isGlutenFree: true,
    moodTags: ['neutral', 'energetic', 'relaxing'],
  },
  
  // Desserts
  {
    name: 'Tiramisu',
    category: 'dessert',
    description: 'Classic Italian coffee-flavored dessert',
    price: 7.99,
    isVegetarian: true,
    moodTags: ['happy', 'neutral'],
  },
  {
    name: 'Ice Cream Sundae',
    category: 'dessert',
    description: 'Three scoops with toppings of your choice',
    price: 6.99,
    isVegetarian: true,
    moodTags: ['happy', 'comfort', 'sad'],
  },
  
  // Sides
  {
    name: 'Loaded Fries',
    category: 'side',
    description: 'Crispy fries with cheese, bacon, and sour cream',
    price: 7.99,
    isVegetarian: false,
    moodTags: ['happy', 'comfort'],
  },
  {
    name: 'Garden Salad',
    category: 'side',
    description: 'Fresh mixed greens with vinaigrette',
    price: 5.99,
    isVegetarian: true,
    isVegan: true,
    isGlutenFree: true,
    moodTags: ['neutral', 'relaxing'],
  },
];

const seedFoodItems = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing food items
    await FoodItem.deleteMany({});
    console.log('Cleared existing food items');

    // Insert sample data
    await FoodItem.insertMany(sampleFoodItems);
    console.log(`✅ Successfully seeded ${sampleFoodItems.length} food items`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding food items:', error.message);
    process.exit(1);
  }
};

seedFoodItems();
