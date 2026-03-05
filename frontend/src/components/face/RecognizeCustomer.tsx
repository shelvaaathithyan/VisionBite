import React, { useState } from 'react';
import { Scan, ShoppingCart, History } from 'lucide-react';
import WebcamCapture from './WebcamCapture';
import { customerService, orderService } from '../../services/api';
import { FaceRecognitionResult, FoodItem } from '../../types/customer';

const RecognizeCustomer: React.FC = () => {
  const [showCamera, setShowCamera] = useState(false);
  const [recognizing, setRecognizing] = useState(false);
  const [recognitionResult, setRecognitionResult] = useState<FaceRecognitionResult | null>(null);
  const [detectedMood, setDetectedMood] = useState('');
  const [recommendations, setRecommendations] = useState<FoodItem[]>([]);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [selectedItems, setSelectedItems] = useState<Map<string, number>>(new Map());

  const handleFaceCapture = async (descriptor: number[], emotion: string) => {
    setShowCamera(false);
    setRecognizing(true);
    setDetectedMood(emotion);
    setMessage({ type: '', text: '' });

    try {
      const response = await customerService.recognizeCustomer(descriptor);
      
      if (response.data.isNewCustomer) {
        setMessage({
          type: 'warning',
          text: 'Customer not recognized. Please enroll them first.',
        });
        setRecognitionResult(null);
        setRecommendations([]);
      } else {
        setRecognitionResult(response.data);
        setMessage({
          type: 'success',
          text: `Welcome back, ${response.data.customer.name}! (${(parseFloat(response.data.matchConfidence) * 100).toFixed(0)}% match)`,
        });

        // Get recommendations
        const recResponse = await customerService.getRecommendations(
          response.data.customer.id,
          emotion
        );
        setRecommendations(recResponse.data.recommendations);
      }
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Recognition failed',
      });
      setRecognitionResult(null);
    } finally {
      setRecognizing(false);
    }
  };

  const handleQuantityChange = (foodId: string, change: number) => {
    const newMap = new Map(selectedItems);
    const current = newMap.get(foodId) || 0;
    const newQuantity = Math.max(0, current + change);

    if (newQuantity === 0) {
      newMap.delete(foodId);
    } else {
      newMap.set(foodId, newQuantity);
    }

    setSelectedItems(newMap);
  };

  const handleCreateOrder = async () => {
    if (!recognitionResult || selectedItems.size === 0) {
      setMessage({ type: 'error', text: 'Please select items to order' });
      return;
    }

    try {
      const items = Array.from(selectedItems.entries()).map(([foodItemId, quantity]) => ({
        foodItemId,
        quantity,
      }));

      await orderService.createOrder({
        customerId: recognitionResult.customer.id,
        items,
        detectedMood,
      });

      setMessage({ type: 'success', text: 'Order created successfully!' });
      setSelectedItems(new Map());
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to create order',
      });
    }
  };

  const getTotalAmount = () => {
    let total = 0;
    selectedItems.forEach((quantity, foodId) => {
      const item = recommendations.find(f => f._id === foodId);
      if (item) {
        total += item.price * quantity;
      }
    });
    return total.toFixed(2);
  };

  return (
    <div className="space-y-6">
      {/* Recognition Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-6">
          <Scan className="text-purple-500" size={28} />
          <h2 className="text-2xl font-bold text-gray-800">Recognize Customer</h2>
        </div>

        {message.text && (
          <div
            className={`mb-4 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-100 border border-green-400 text-green-700'
                : message.type === 'warning'
                ? 'bg-yellow-100 border border-yellow-400 text-yellow-700'
                : 'bg-red-100 border border-red-400 text-red-700'
            }`}
          >
            {message.text}
          </div>
        )}

        <button
          onClick={() => setShowCamera(true)}
          disabled={recognizing}
          className="flex items-center gap-2 px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-semibold disabled:bg-gray-300"
        >
          <Scan size={20} />
          {recognizing ? 'Recognizing...' : 'Start Recognition'}
        </button>

        {recognitionResult && (
          <div className="mt-6 grid md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-3">Customer Information</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Name:</strong> {recognitionResult.customer.name}</p>
                <p><strong>Visits:</strong> {recognitionResult.customer.visitCount}</p>
                <p><strong>Detected Mood:</strong> <span className="capitalize">{detectedMood}</span></p>
                {recognitionResult.customer.phone && (
                  <p><strong>Phone:</strong> {recognitionResult.customer.phone}</p>
                )}
                {recognitionResult.customer.email && (
                  <p><strong>Email:</strong> {recognitionResult.customer.email}</p>
                )}
                {recognitionResult.customer.dietaryRestrictions.length > 0 && (
                  <p>
                    <strong>Restrictions:</strong>{' '}
                    {recognitionResult.customer.dietaryRestrictions.join(', ')}
                  </p>
                )}
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <History size={20} />
                Recent Orders
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {recognitionResult.orderHistory.length === 0 ? (
                  <p className="text-sm text-gray-500">No previous orders</p>
                ) : (
                  recognitionResult.orderHistory.slice(0, 5).map(order => (
                    <div key={order._id} className="text-sm border-b pb-2">
                      <p className="font-medium">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-gray-600">
                        {order.items.length} items - ${order.totalAmount.toFixed(2)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recommendations Section */}
      {recommendations.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Personalized Recommendations
            <span className="text-sm text-gray-500 ml-2 font-normal">
              Based on mood: <span className="capitalize font-semibold">{detectedMood}</span>
            </span>
          </h3>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {recommendations.map(item => (
              <div
                key={item._id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-gray-800">{item.name}</h4>
                  <span className="text-lg font-bold text-blue-600">${item.price}</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {item.category}
                  </span>
                  {item.isVegetarian && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      Vegetarian
                    </span>
                  )}
                  {item.spicyLevel > 0 && (
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                      🌶️ {item.spicyLevel}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleQuantityChange(item._id, -1)}
                    className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded font-bold"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-semibold">
                    {selectedItems.get(item._id) || 0}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(item._id, 1)}
                    className="w-8 h-8 bg-blue-500 hover:bg-blue-600 text-white rounded font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          {selectedItems.size > 0 && (
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold">
                  Total Items: {Array.from(selectedItems.values()).reduce((a, b) => a + b, 0)}
                </span>
                <span className="text-2xl font-bold text-blue-600">
                  ${getTotalAmount()}
                </span>
              </div>
              <button
                onClick={handleCreateOrder}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold"
              >
                <ShoppingCart size={20} />
                Place Order
              </button>
            </div>
          )}
        </div>
      )}

      {showCamera && (
        <WebcamCapture
          title="Scan Customer Face"
          onCapture={handleFaceCapture}
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  );
};

export default RecognizeCustomer;
