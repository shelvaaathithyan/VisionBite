import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import EnrollCustomer from '../components/face/EnrollCustomer';
import RecognizeCustomer from '../components/face/RecognizeCustomer';
import { UserPlus, Scan, ArrowLeft, LogOut } from 'lucide-react';

const VisionBitePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'recognize' | 'enroll'>('recognize');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft size={20} />
              Back to Dashboard
            </button>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {user?.name} ({user?.role})
            </span>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">VisionBite AI</h1>
          <p className="text-gray-600">
            Face recognition, mood detection, and personalized food recommendations
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('recognize')}
            className={`flex items-center gap-2 px-6 py-3 font-semibold transition ${
              activeTab === 'recognize'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Scan size={20} />
            Recognize Customer
          </button>
          <button
            onClick={() => setActiveTab('enroll')}
            className={`flex items-center gap-2 px-6 py-3 font-semibold transition ${
              activeTab === 'enroll'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <UserPlus size={20} />
            Enroll New Customer
          </button>
        </div>

        {/* Content */}
        <div>
          {activeTab === 'recognize' ? <RecognizeCustomer /> : <EnrollCustomer />}
        </div>
      </div>
    </div>
  );
};

export default VisionBitePage;
