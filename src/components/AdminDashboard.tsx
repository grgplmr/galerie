import React, { useState } from 'react';
import { Plus, Camera, Eye, Trash2, LogOut, Upload, X } from 'lucide-react';
import { Gallery, Photo } from '../types';
import { resizeImage, generateId } from '../utils/helpers';

interface AdminDashboardProps {
  galleries: Gallery[];
  onCreate: (gallery: Gallery) => void;
  onDelete: (galleryId: string) => void;
  onView: (gallery: Gallery) => void;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  galleries,
  onCreate,
  onDelete,
  onView,
  onLogout
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [galleryName, setGalleryName] = useState('');
  const [galleryPassword, setGalleryPassword] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreateGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!galleryName.trim() || !galleryPassword.trim() || uploadedFiles.length === 0) return;

    setIsCreating(true);

    try {
      const photos: Photo[] = [];
      
      for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i];
        const resizedImage = await resizeImage(file, 1024);
        const thumbnail = await resizeImage(file, 300);
        
        photos.push({
          id: generateId(),
          url: resizedImage,
          thumbnail: thumbnail,
          name: file.name,
          ratings: []
        });
      }

      const newGallery: Gallery = {
        id: generateId(),
        name: galleryName.trim(),
        password: galleryPassword.trim(),
        photos,
        createdAt: Date.now()
      };

      onCreate(newGallery);
      
      // Reset form
      setGalleryName('');
      setGalleryPassword('');
      setUploadedFiles([]);
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating gallery:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
              <Camera className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-gray-300">Manage your private galleries</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">Total Galleries</h3>
            <p className="text-3xl font-bold">{galleries.length}</p>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">Total Photos</h3>
            <p className="text-3xl font-bold">{galleries.reduce((sum, g) => sum + g.photos.length, 0)}</p>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">Total Ratings</h3>
            <p className="text-3xl font-bold">
              {galleries.reduce((sum, g) => 
                sum + g.photos.reduce((photoSum, p) => photoSum + p.ratings.length, 0), 0
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Galleries</h2>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
          >
            <Plus className="h-5 w-5" />
            <span>Create New Gallery</span>
          </button>
        </div>

        {showCreateForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Create New Gallery</h3>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleCreateGallery} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Gallery Name
                  </label>
                  <input
                    type="text"
                    value={galleryName}
                    onChange={(e) => setGalleryName(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter gallery name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Gallery Password
                  </label>
                  <input
                    type="text"
                    value={galleryPassword}
                    onChange={(e) => setGalleryPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter gallery password"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Upload Photos
                  </label>
                  <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="photo-upload"
                    />
                    <label
                      htmlFor="photo-upload"
                      className="cursor-pointer flex flex-col items-center space-y-4"
                    >
                      <Upload className="h-12 w-12 text-gray-400" />
                      <div>
                        <p className="text-white font-medium">Click to upload photos</p>
                        <p className="text-gray-400 text-sm">Or drag and drop images here</p>
                      </div>
                    </label>
                  </div>

                  {uploadedFiles.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-white font-medium mb-2">
                        Selected Photos ({uploadedFiles.length})
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                        {uploadedFiles.map((file, index) => (
                          <div key={index} className="relative">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={file.name}
                              className="w-full h-20 object-cover rounded"
                            />
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 py-3 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating || !galleryName.trim() || !galleryPassword.trim() || uploadedFiles.length === 0}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCreating ? 'Creating...' : 'Create Gallery'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleries.map((gallery) => (
            <div
              key={gallery.id}
              className="bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/20 hover:bg-white/15 transition-all"
            >
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2">{gallery.name}</h3>
                <div className="flex items-center space-x-4 text-gray-300 text-sm mb-4">
                  <span>{gallery.photos.length} photos</span>
                  <span>•</span>
                  <span>Created {new Date(gallery.createdAt).toLocaleDateString()}</span>
                </div>
                
                {gallery.photos.length > 0 && (
                  <div className="grid grid-cols-3 gap-1 mb-4">
                    {gallery.photos.slice(0, 3).map((photo) => (
                      <img
                        key={photo.id}
                        src={photo.thumbnail}
                        alt={photo.name}
                        className="w-full h-16 object-cover rounded"
                      />
                    ))}
                  </div>
                )}

                <div className="flex space-x-2">
                  <button
                    onClick={() => onView(gallery)}
                    className="flex-1 flex items-center justify-center space-x-2 py-2 px-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View</span>
                  </button>
                  <button
                    onClick={() => onDelete(gallery.id)}
                    className="flex items-center justify-center py-2 px-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {galleries.length === 0 && (
          <div className="text-center py-12">
            <Camera className="h-24 w-24 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No galleries yet</h3>
            <p className="text-gray-400 mb-6">Create your first private gallery to get started</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              <Plus className="h-5 w-5" />
              <span>Create Gallery</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};