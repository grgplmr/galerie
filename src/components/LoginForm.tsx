import React, { useState } from 'react';
import { Camera, Lock, Key, Eye, EyeOff } from 'lucide-react';
import { Gallery, User } from '../types';

interface LoginFormProps {
  onLogin: (user: User) => void;
  galleries: Gallery[];
  onViewGallery: (gallery: Gallery) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin, galleries, onViewGallery }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState('');
  const [selectedGallery, setSelectedGallery] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isAdmin) {
      if (password === 'admin123') {
        onLogin({ id: 'admin', role: 'admin' });
      } else {
        setError('Invalid admin password');
      }
    } else {
      const gallery = galleries.find(g => g.id === selectedGallery);
      if (!gallery) {
        setError('Please select a gallery');
        return;
      }
      
      if (password === gallery.password) {
        onLogin({ id: `viewer_${Date.now()}`, role: 'viewer', galleryId: gallery.id });
        onViewGallery(gallery);
      } else {
        setError('Invalid gallery password');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
            <Camera className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">PrivataGallery</h2>
          <p className="text-gray-300">Access your private photo galleries</p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
          <div className="flex mb-6">
            <button
              type="button"
              onClick={() => setIsAdmin(false)}
              className={`flex-1 py-2 px-4 rounded-l-lg font-medium transition-all ${
                !isAdmin
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              Gallery Access
            </button>
            <button
              type="button"
              onClick={() => setIsAdmin(true)}
              className={`flex-1 py-2 px-4 rounded-r-lg font-medium transition-all ${
                isAdmin
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              Admin Panel
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isAdmin && (
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Select Gallery
                </label>
                <select
                  value={selectedGallery}
                  onChange={(e) => setSelectedGallery(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Choose a gallery...</option>
                  {galleries.map((gallery) => (
                    <option key={gallery.id} value={gallery.id} className="text-gray-900">
                      {gallery.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {isAdmin ? <Key className="h-5 w-5 text-purple-400" /> : <Lock className="h-5 w-5 text-blue-400" />}
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={isAdmin ? "Admin password" : "Gallery password"}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-red-400 text-sm text-center bg-red-500/20 border border-red-500/50 rounded-lg p-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all transform hover:scale-105 active:scale-95 ${
                isAdmin
                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg shadow-purple-500/25'
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/25'
              }`}
            >
              {isAdmin ? 'Access Admin Panel' : 'Access Gallery'}
            </button>
          </form>

          {isAdmin && (
            <div className="mt-6 p-4 bg-purple-500/20 border border-purple-500/50 rounded-lg">
              <p className="text-sm text-purple-200">
                <strong>Demo Admin Password:</strong> admin123
              </p>
            </div>
          )}

          {!isAdmin && galleries.length === 0 && (
            <div className="mt-6 p-4 bg-blue-500/20 border border-blue-500/50 rounded-lg">
              <p className="text-sm text-blue-200">
                No galleries available. Please contact your administrator.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};