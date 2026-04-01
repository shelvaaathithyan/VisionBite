import mongoose from 'mongoose';

const foodItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide food name'],
      trim: true,
      unique: true,
    },
    category: {
      type: String,
      required: [true, 'Please provide category'],
      enum: ['appetizer', 'main', 'dessert', 'beverage', 'side', 'special'],
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Please provide price'],
      min: [120, 'Price must be at least 120'],
      max: [250, 'Price cannot exceed 250'],
    },
    image: {
      type: String,
    },
    isVegetarian: {
      type: Boolean,
      default: false,
    },
    isVegan: {
      type: Boolean,
      default: false,
    },
    isGlutenFree: {
      type: Boolean,
      default: false,
    },
    spicyLevel: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    moodTags: {
      type: [String],
      enum: ['happy', 'sad', 'neutral', 'angry', 'surprised', 'comfort', 'energetic', 'relaxing'],
      default: [],
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const FoodItem = mongoose.model('FoodItem', foodItemSchema);

export default FoodItem;
