# VisionBite AI - Face Recognition & Mood-Based Food Recommendations

## 🎯 Overview

VisionBite AI is an advanced facial recognition system integrated with your VisionBite application that:

1. **Recognizes customers** using their face
2. **Detects mood/emotions** in real-time
3. **Recommends personalized food** based on:
   - Customer's mood
   - Previous order history
   - Dietary restrictions
   - Food preferences

## 🚀 Features

### For Admin & Staff

- **Customer Enrollment**: Register new customers with facial recognition
- **Face Recognition**: Instantly identify returning customers
- **Mood Detection**: Real-time emotion recognition (happy, sad, neutral, angry, surprised, etc.)
- **Smart Recommendations**: AI-powered food suggestions based on mood and history
- **Order Management**: Create orders directly from recommendations
- **Customer Profiles**: Track visit count, preferences, and dietary restrictions

## 📋 How to Use

### 1. Enroll Your 5 Friends

1. Login as admin/staff: `shelva@test.com` / `shelva`
2. Click **"VisionBite AI"** button in the dashboard header
3. Go to **"Enroll New Customer"** tab
4. For each friend:
   - Enter their name (required)
   - Add phone/email (optional)
   - Select food preferences (appetizer, main, dessert, etc.)
   - Select dietary restrictions if any (vegetarian, vegan, gluten-free)
   - Click **"Capture Face"** and allow camera access
   - Position face in the frame (system auto-detects face and emotion)
   - Click **"Capture Face"** button
   - Click **"Enroll Customer"**

### 2. Recognize Customers

1. Go to **"Recognize Customer"** tab
2. Click **"Start Recognition"**
3. Customer looks at the camera
4. System will:
   - Detect the face
   - Identify the customer (with confidence score)
   - Detect current mood
   - Show customer info and order history
   - Display personalized food recommendations

### 3. Create Orders

1. After recognition, recommendations appear based on mood
2. Use **+/-** buttons to select items and quantities
3. Review total amount
4. Click **"Place Order"** to create the order

## 🍔 Food Recommendation System

The system uses a smart scoring algorithm that considers:

1. **Mood Matching (Highest Priority)**
   - Each food item has mood tags (happy, sad, comfort, energetic, etc.)
   - Items matching customer's detected mood get highest score

2. **Order History**
   - Frequently ordered items get bonus points
   - System learns customer preferences over time

3. **Personal Preferences**
   - Category preferences (appetizer, main, dessert, etc.)
   - Dietary restrictions are automatically filtered

### Sample Food Database

The system comes with 15 pre-configured food items:

**Comfort Foods** (for sad mood):
- Classic Mac & Cheese
- Chocolate Lava Cake
- Hot Chocolate

**Energetic Foods** (for happy/energetic mood):
- Spicy Thai Basil Chicken
- Fresh Fruit Smoothie Bowl
- Fresh Lemonade

**Neutral Options**:
- Grilled Chicken Caesar Salad
- Margherita Pizza
- Quinoa Buddha Bowl

And more...

## 🔧 Technical Details

### Backend APIs

**Customer Management:**
- `POST /api/customers/enroll` - Enroll new customer with face descriptor
- `GET /api/customers` - Get all enrolled customers
- `POST /api/customers/recognize` - Recognize customer by face
- `POST /api/customers/recommendations` - Get personalized recommendations
- `PUT /api/customers/:id` - Update customer info
- `DELETE /api/customers/:id` - Delete customer

**Food Management:**
- `GET /api/food` - Get all food items
- `POST /api/food` - Create new food item (admin only)
- `PUT /api/food/:id` - Update food item (admin only)
- `DELETE /api/food/:id` - Delete food item (admin only)

**Order Management:**
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id/status` - Update order status
- `GET /api/orders/customer/:customerId` - Get customer's order history

### Database Models

1. **Customer**: Stores face descriptors (128-dimensional), preferences, restrictions
2. **FoodItem**: Stores menu items with mood tags, dietary info, pricing
3. **Order**: Tracks customer orders with mood at time of order

### Face Recognition Technology

- **Library**: face-api.js (TensorFlow.js based)
- **Models Used**:
  - Tiny Face Detector (fast, lightweight)
  - Face Landmark Detection (68 points)
  - Face Recognition (128-d descriptor)
  - Face Expression Recognition (7 emotions)
- **Matching Algorithm**: Euclidean distance with 0.6 threshold
- **Accuracy**: ~85-95% in good lighting conditions

## 🎨 User Interface

### Webcam Capture Component
- Real-time face detection overlay
- Live emotion display
- Visual feedback when face is detected
- Camera permission handling
- Mobile responsive

### Enrollment Interface
- Form for customer details
- Preference selection with toggle buttons
- Dietary restriction filters
- Success/error messaging
- Form validation

### Recognition Interface
- Customer profile display
- Order history sidebar
- Confidence score
- Grid layout for recommendations
- Shopping cart functionality
- One-click ordering

## 📱 Access Control

Both **admin** and **staff** roles have full access to VisionBite AI features:
- Customer enrollment
- Face recognition
- Recommendations
- Order creation

## 🔐 Privacy & Security

- Face descriptors are stored as mathematical vectors (not images)
- Camera access requires user permission
- All APIs require authentication
- Customer data can be deleted anytime
- HTTPS recommended for production

## 🚦 Running the System

### Backend
```bash
cd backend
npm start
# Server runs on http://localhost:5000
```

### Frontend
```bash
cd frontend
npm run dev
# App runs on http://localhost:5173 (or configured port)
```

## 📝 Adding More Users Later

To add more customers after initial 5:
1. Simply go to "Enroll New Customer" tab
2. Repeat enrollment process
3. System automatically trains with new data
4. No manual retraining needed

## 🐛 Troubleshooting

**Camera not working?**
- Check browser permissions
- Ensure HTTPS or localhost
- Try different browser (Chrome recommended)

**Face not detected?**
- Ensure good lighting
- Look directly at camera
- Remove glasses/hats if possible
- Move closer to camera

**Recognition failing?**
- Enroll user again with better lighting
- Ensure face is clearly visible during enrollment
- Check match confidence score

**Recommendations not relevant?**
- System improves with more order history
- Check mood detection accuracy
- Update customer preferences
- Adjust food item mood tags

## 🎯 Future Enhancements

- Multiple face enrollment per customer
- Age/gender-based recommendations
- Voice ordering integration
- Customer loyalty tracking
- Analytics dashboard
- Batch enrollment
- Face aging tolerance

## 📚 Resources

- Face-API.js: https://github.com/justadudewhohacks/face-api.js
- TensorFlow.js: https://www.tensorflow.org/js

---

**Enjoy VisionBite AI! 🎉**

For support or questions, check the system logs or contact your administrator.
