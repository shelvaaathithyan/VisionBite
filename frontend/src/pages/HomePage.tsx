import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import * as THREE from 'three';
import NET from 'vanta/dist/vanta.net.min';

export const HomePage: React.FC = () => {
  const vantaRef = useRef<HTMLDivElement>(null);
  const vantaEffectRef = useRef<{ destroy: () => void } | null>(null);

  useEffect(() => {
    if (vantaRef.current) {
      vantaEffectRef.current = NET({
        el: vantaRef.current,
        THREE,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.00,
        minWidth: 200.00,
        scale: 1.00,
        scaleMobile: 1.00,
        color: 0x290cd3,
        points: 9.00,
        maxDistance: 22.00,
        spacing: 17.00,
      });
    }

    return () => {
      if (vantaEffectRef.current) {
        vantaEffectRef.current.destroy();
      }
    };
  }, []);

  return (
    <div 
      ref={vantaRef} 
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{ backgroundColor: '#0a0a0a' }}
    >
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-black/10"></div>
      
      <div className="max-w-3xl w-full relative z-10">
        <div className="bg-white rounded-3xl shadow-2xl p-12">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-black text-gray-900 mb-3">VisionBite</h1>
            <p className="text-xl text-indigo-600 font-semibold mb-2">Authentication System</p>
            <p className="text-gray-600">Professional Role-Based Access Control</p>
          </div>

          <div className="space-y-3 mb-10">
            <Link
              to="/login"
              className="block w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold py-4 px-6 rounded-xl text-center hover:from-indigo-700 hover:to-blue-700 transition duration-300 shadow-lg hover:shadow-indigo-500/50 transform hover:scale-105"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="block w-full bg-gray-100 text-gray-900 font-bold py-4 px-6 rounded-xl text-center hover:bg-gray-200 transition duration-300 border-2 border-gray-300 transform hover:scale-105"
            >
              Register as Staff
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mr-3 text-sm">👤</span>
                For Staff
              </h3>
              <ul className="text-gray-700 text-sm space-y-2">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2 font-bold">✓</span>
                  <span>Easy registration process</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2 font-bold">✓</span>
                  <span>Admin approval workflow</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2 font-bold">✓</span>
                  <span>Secure authentication</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-200">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                <span className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center mr-3 text-sm">👨‍💼</span>
                For Admins
              </h3>
              <ul className="text-gray-700 text-sm space-y-2">
                <li className="flex items-start">
                  <span className="text-indigo-600 mr-2 font-bold">✓</span>
                  <span>Manage staff approvals</span>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-600 mr-2 font-bold">✓</span>
                  <span>View pending requests</span>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-600 mr-2 font-bold">✓</span>
                  <span>Accept or reject users</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
