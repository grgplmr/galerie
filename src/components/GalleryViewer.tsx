import React, { useState, useEffect } from 'react';
import { ArrowLeft, Star, Filter, Download, Eye } from 'lucide-react';
import { Gallery, Photo, StarFilter } from '../types';
import { PhotoGrid } from './PhotoGrid';
import { getRatings, saveRating, exportRatings } from '../utils/storage';

interface GalleryViewerProps {
  gallery: Gallery;
  isAdmin: boolean;
  onBack: () => void;
}

export const GalleryViewer: React.FC<GalleryViewerProps> = ({ gallery, isAdmin, onBack }) => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [filteredPhotos, setFilteredPhotos] = useState<Photo[]>([]);
  const [starFilters, setStarFilters] = useState<StarFilter[]>([
    { stars: 5, active: false },
    { stars: 4, active: false },
    { stars: 3, active: false },
    { stars: 2, active: false },
    { stars: 1, active: false },
  ]);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  useEffect(() => {
    // Load photos with ratings
    const photosWithRatings = gallery.photos.map(photo => {
      const ratings = getRatings(gallery.id, photo.id);
      const averageRating = ratings.length > 0 
        ? ratings.reduce((sum, r) => sum + r.stars, 0) / ratings.length 
        : 0;
      
      return {
        ...photo,
        ratings,
        averageRating
      };
    });
    
    setPhotos(photosWithRatings);
    setFilteredPhotos(photosWithRatings);
  }, [gallery]);

  useEffect(() => {
    const activeFilters = starFilters.filter(f => f.active).map(f => f.stars);
    
    if (activeFilters.length === 0) {
      setFilteredPhotos(photos);
    } else {
      const filtered = photos.filter(photo => {
        const avgRating = Math.round(photo.averageRating || 0);
        return activeFilters.includes(avgRating);
      });
      setFilteredPhotos(filtered);
    }
  }, [starFilters, photos]);

  const handleRatePhoto = (photoId: string, stars: number) => {
    const userId = localStorage.getItem('userId') || `user_${Date.now()}`;
    localStorage.setItem('userId', userId);

    saveRating(gallery.id, photoId, userId, stars);
    
    // Update photos with new ratings
    const updatedPhotos = photos.map(photo => {
      if (photo.id === photoId) {
        const ratings = getRatings(gallery.id, photo.id);
        const averageRating = ratings.length > 0 
          ? ratings.reduce((sum, r) => sum + r.stars, 0) / ratings.length 
          : 0;
        
        return {
          ...photo,
          ratings,
          averageRating
        };
      }
      return photo;
    });
    
    setPhotos(updatedPhotos);
  };

  const toggleStarFilter = (stars: number) => {
    setStarFilters(prev => 
      prev.map(filter => 
        filter.stars === stars 
          ? { ...filter, active: !filter.active }
          : filter
      )
    );
  };

  const clearFilters = () => {
    setStarFilters(prev => prev.map(filter => ({ ...filter, active: false })));
  };

  const handleExport = () => {
    exportRatings(gallery.id, gallery.name, photos);
  };

  const getUserRating = (photo: Photo): number => {
    const userId = localStorage.getItem('userId');
    if (!userId) return 0;
    
    const userRating = photo.ratings.find(r => r.userId === userId);
    return userRating ? userRating.stars : 0;
  };

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-40 bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">{gallery.name}</h1>
                <p className="text-gray-300">{filteredPhotos.length} of {photos.length} photos</p>
              </div>
            </div>

            {isAdmin && (
              <button
                onClick={handleExport}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Export Ratings</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-4 mt-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-300" />
              <span className="text-gray-300 text-sm">Filter by rating:</span>
            </div>
            
            {starFilters.map((filter) => (
              <button
                key={filter.stars}
                onClick={() => toggleStarFilter(filter.stars)}
                className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm transition-all ${
                  filter.active
                    ? 'bg-yellow-500 text-black'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                <Star className={`h-3 w-3 ${filter.active ? 'fill-current' : ''}`} />
                <span>{filter.stars}</span>
              </button>
            ))}
            
            <button
              onClick={clearFilters}
              className="px-3 py-1 text-sm text-gray-300 hover:text-white transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <PhotoGrid
          photos={filteredPhotos}
          onPhotoClick={setSelectedPhoto}
          onRate={handleRatePhoto}
          getUserRating={getUserRating}
        />
      </div>

      {selectedPhoto && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="max-w-4xl max-h-[90vh] relative">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <span className="text-2xl">×</span>
            </button>
            
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.name}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
            
            <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm p-4 rounded-b-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium">{selectedPhoto.name}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= Math.round(selectedPhoto.averageRating || 0)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-400'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-gray-300 text-sm">
                      {selectedPhoto.averageRating ? selectedPhoto.averageRating.toFixed(1) : '0.0'} 
                      ({selectedPhoto.ratings.length} votes)
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRatePhoto(selectedPhoto.id, star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          star <= getUserRating(selectedPhoto)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-400 hover:text-yellow-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};