import React, { useState } from 'react';
import { UserPlus, Camera } from 'lucide-react';
import WebcamCapture from './WebcamCapture';
import { customerService } from '../../services/api';

const EnrollCustomer: React.FC = () => {
  const [showCamera, setShowCamera] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    preferences: [] as string[],
    dietaryRestrictions: [] as string[],
  });
  const [capturing, setCapturing] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [faceDescriptor, setFaceDescriptor] = useState<number[] | null>(null);

  const categories = ['appetizer', 'main', 'dessert', 'beverage', 'side', 'special'];
  const restrictions = ['vegetarian', 'vegan', 'gluten-free', 'dairy-free'];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePreferenceToggle = (category: string) => {
    setFormData(prev => ({
      ...prev,
      preferences: prev.preferences.includes(category)
        ? prev.preferences.filter(p => p !== category)
        : [...prev.preferences, category],
    }));
  };

  const handleRestrictionToggle = (restriction: string) => {
    setFormData(prev => ({
      ...prev,
      dietaryRestrictions: prev.dietaryRestrictions.includes(restriction)
        ? prev.dietaryRestrictions.filter(r => r !== restriction)
        : [...prev.dietaryRestrictions, restriction],
    }));
  };

  const handleFaceCapture = (descriptor: number[], emotion: string) => {
    setFaceDescriptor(descriptor);
    setShowCamera(false);
    setMessage({ type: 'success', text: `Face captured successfully! Detected emotion: ${emotion}` });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      setMessage({ type: 'error', text: 'Please enter customer name' });
      return;
    }

    if (!faceDescriptor) {
      setMessage({ type: 'error', text: 'Please capture face first' });
      return;
    }

    try {
      setCapturing(true);
      await customerService.enrollCustomer({
        ...formData,
        faceDescriptor,
      });

      setMessage({ type: 'success', text: 'Customer enrolled successfully!' });
      
      // Reset form
      setFormData({
        name: '',
        phone: '',
        email: '',
        preferences: [],
        dietaryRestrictions: [],
      });
      setFaceDescriptor(null);
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to enroll customer',
      });
    } finally {
      setCapturing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-3 mb-6">
        <UserPlus className="text-blue-500" size={28} />
        <h2 className="text-2xl font-bold text-gray-800">Enroll New Customer</h2>
      </div>

      {message.text && (
        <div
          className={`mb-4 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-100 border border-green-400 text-green-700'
              : 'bg-red-100 border border-red-400 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone (Optional)
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email (Optional)
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Food Preferences */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Food Preferences
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                type="button"
                onClick={() => handlePreferenceToggle(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  formData.preferences.includes(category)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Dietary Restrictions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dietary Restrictions
          </label>
          <div className="flex flex-wrap gap-2">
            {restrictions.map(restriction => (
              <button
                key={restriction}
                type="button"
                onClick={() => handleRestrictionToggle(restriction)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  formData.dietaryRestrictions.includes(restriction)
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {restriction.charAt(0).toUpperCase() + restriction.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Face Capture */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Face Recognition *
          </label>
          <button
            type="button"
            onClick={() => setShowCamera(true)}
            className={`w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold ${
              faceDescriptor
                ? 'bg-green-500 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            <Camera size={20} />
            {faceDescriptor ? '✓ Face Captured - Recapture?' : 'Capture Face'}
          </button>
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={capturing || !faceDescriptor}
            className={`flex-1 md:flex-none px-8 py-3 rounded-lg font-semibold ${
              capturing || !faceDescriptor
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {capturing ? 'Enrolling...' : 'Enroll Customer'}
          </button>
        </div>
      </form>

      {showCamera && (
        <WebcamCapture
          title="Capture Customer Face"
          onCapture={handleFaceCapture}
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  );
};

export default EnrollCustomer;
