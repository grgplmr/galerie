import React, { useState, useEffect } from 'react';
import { Star, Eye } from 'lucide-react';
import { Photo } from '../types';

interface PhotoGridProps {
  photos: Photo[];
  onPhotoClick: (photo: Photo) => void;
  onRate: (photoId: string, stars: number) => void;
  getUserRating: (photo: Photo) => number;
}

export const PhotoGrid: React.FC<PhotoGridProps> = ({
  photos,
  onPhotoClick,
  onRate,
  getUserRating
}) => {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    setLoadedImages(new Set());
  }, [photos]);

  const handleImageLoad = (photoId: string) => {
    setLoadedImages(prev => new Set([...prev, photoId]));
  };

  const getColumnCount = () => {
    if (typeof window === 'undefined') return 3;
    if (window.innerWidth < 640) return 1;
    if (window.innerWidth < 1024) return 2;
    if (window.innerWidth < 1536) return 3;
    return 4;
  };

  const [columns, setColumns] = useState(getColumnCount());

  useEffect(() => {
    const handleResize = () => {
      setColumns(getColumnCount());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const distributePhotos = () => {
    const cols: Photo[][] = Array.from({ length: columns }, () => []);
    
    photos.forEach((photo, index) => {
      cols[index % columns].push(photo);
    });
    
    return cols;
  };

  if (photos.length === 0) {
    return (
      <div className="text-center py-12">
        <Eye className="h-24 w-24 text-gray-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No photos match your filter</h3>
        <p className="text-gray-400">Try adjusting your star rating filters</p>
      </div>
    );
  }

  return (
    <div className={`grid gap-4 ${
      columns === 1 ? 'grid-cols-1' :
      columns === 2 ? 'grid-cols-2' :
      columns === 3 ? 'grid-cols-3' :
      'grid-cols-4'
    }`}>
      {distributePhotos().map((column, colIndex) => (
        <div key={colIndex} className="space-y-4">
          {column.map((photo) => (
            <div
              key={photo.id}
              className={`relative group bg-white/5 rounded-lg overflow-hidden border border-white/10 transition-all duration-500 hover:scale-105 hover:shadow-2xl ${
                loadedImages.has(photo.id) ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                animation: loadedImages.has(photo.id) ? 'fadeInUp 0.6s ease-out' : 'none'
              }}
            >
              <img
                src={photo.thumbnail}
                alt={photo.name}
                className="w-full h-auto object-cover cursor-pointer"
                onLoad={() => handleImageLoad(photo.id)}
                onClick={() => onPhotoClick(photo)}
              />
              
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <button
                    onClick={() => onPhotoClick(photo)}
                    className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors"
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= Math.round(photo.averageRating || 0)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-400'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-white text-sm">
                      ({photo.ratings.length})
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={(e) => {
                          e.stopPropagation();
                          onRate(photo.id, star);
                        }}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`h-4 w-4 ${
                            star <= getUserRating(photo)
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
          ))}
        </div>
      ))}

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};