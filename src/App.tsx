import React, { useState, useEffect } from 'react';
import { AdminDashboard } from './components/AdminDashboard';
import { GalleryViewer } from './components/GalleryViewer';
import { LoginForm } from './components/LoginForm';
import { Gallery, User } from './types';
import { loadGalleries, saveGalleries } from './utils/storage';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [currentView, setCurrentView] = useState<'login' | 'admin' | 'gallery'>('login');
  const [selectedGallery, setSelectedGallery] = useState<Gallery | null>(null);

  useEffect(() => {
    setGalleries(loadGalleries());
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    setCurrentView(userData.role === 'admin' ? 'admin' : 'gallery');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('login');
    setSelectedGallery(null);
  };

  const handleCreateGallery = (gallery: Gallery) => {
    const updatedGalleries = [...galleries, gallery];
    setGalleries(updatedGalleries);
    saveGalleries(updatedGalleries);
  };

  const handleDeleteGallery = (galleryId: string) => {
    const updatedGalleries = galleries.filter(g => g.id !== galleryId);
    setGalleries(updatedGalleries);
    saveGalleries(updatedGalleries);
  };

  const handleViewGallery = (gallery: Gallery) => {
    setSelectedGallery(gallery);
    setCurrentView('gallery');
  };

  const handleBackToAdmin = () => {
    setSelectedGallery(null);
    setCurrentView('admin');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {currentView === 'login' && (
        <LoginForm 
          onLogin={handleLogin} 
          galleries={galleries}
          onViewGallery={handleViewGallery}
        />
      )}
      
      {currentView === 'admin' && user?.role === 'admin' && (
        <AdminDashboard
          galleries={galleries}
          onCreate={handleCreateGallery}
          onDelete={handleDeleteGallery}
          onView={handleViewGallery}
          onLogout={handleLogout}
        />
      )}
      
      {currentView === 'gallery' && selectedGallery && (
        <GalleryViewer
          gallery={selectedGallery}
          isAdmin={user?.role === 'admin'}
          onBack={user?.role === 'admin' ? handleBackToAdmin : () => setCurrentView('login')}
        />
      )}
    </div>
  );
}

export default App;