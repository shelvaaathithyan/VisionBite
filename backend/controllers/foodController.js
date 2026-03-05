import FoodItem from '../models/FoodItem.js';

// Get all food items
export const getAllFoodItems = async (req, res) => {
  try {
    const { category, isAvailable } = req.query;
    
    const filter = {};
    if (category) filter.category = category;
    if (isAvailable !== undefined) filter.isAvailable = isAvailable === 'true';

    const foodItems = await FoodItem.find(filter).sort('category name');

    res.status(200).json({
      count: foodItems.length,
      foodItems,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new food item (Admin only)
export const createFoodItem = async (req, res) => {
  try {
    const {
      name,
      category,
      description,
      price,
      image,
      isVegetarian,
      isVegan,
      isGlutenFree,
      spicyLevel,
      moodTags,
    } = req.body;

    if (!name || !category || !price) {
      return res.status(400).json({ message: 'Name, category, and price are required' });
    }

    const foodItem = await FoodItem.create({
      name,
      category,
      description,
      price,
      image,
      isVegetarian,
      isVegan,
      isGlutenFree,
      spicyLevel,
      moodTags: moodTags || [],
    });

    res.status(201).json({
      message: 'Food item created successfully',
      foodItem,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Food item already exists' });
    }
    res.status(500).json({ message: error.message });
  }
};

// Update food item (Admin only)
export const updateFoodItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const foodItem = await FoodItem.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!foodItem) {
      return res.status(404).json({ message: 'Food item not found' });
    }

    res.status(200).json({
      message: 'Food item updated successfully',
      foodItem,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete food item (Admin only)
export const deleteFoodItem = async (req, res) => {
  try {
    const { id } = req.params;

    const foodItem = await FoodItem.findByIdAndDelete(id);
    if (!foodItem) {
      return res.status(404).json({ message: 'Food item not found' });
    }

    res.status(200).json({ message: 'Food item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
