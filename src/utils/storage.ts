import { Gallery, Rating, Photo } from '../types';

const GALLERIES_KEY = 'privata_galleries';
const RATINGS_KEY = 'privata_ratings';

export const loadGalleries = (): Gallery[] => {
  try {
    const stored = localStorage.getItem(GALLERIES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const saveGalleries = (galleries: Gallery[]): void => {
  try {
    localStorage.setItem(GALLERIES_KEY, JSON.stringify(galleries));
  } catch (error) {
    console.error('Failed to save galleries:', error);
  }
};

export const getRatings = (galleryId: string, photoId: string): Rating[] => {
  try {
    const stored = localStorage.getItem(RATINGS_KEY);
    const allRatings = stored ? JSON.parse(stored) : {};
    const galleryRatings = allRatings[galleryId] || {};
    return galleryRatings[photoId] || [];
  } catch {
    return [];
  }
};

export const saveRating = (galleryId: string, photoId: string, userId: string, stars: number): void => {
  try {
    const stored = localStorage.getItem(RATINGS_KEY);
    const allRatings = stored ? JSON.parse(stored) : {};
    
    if (!allRatings[galleryId]) {
      allRatings[galleryId] = {};
    }
    
    if (!allRatings[galleryId][photoId]) {
      allRatings[galleryId][photoId] = [];
    }
    
    // Remove existing rating from this user
    allRatings[galleryId][photoId] = allRatings[galleryId][photoId].filter(
      (rating: Rating) => rating.userId !== userId
    );
    
    // Add new rating
    allRatings[galleryId][photoId].push({
      userId,
      stars,
      timestamp: Date.now()
    });
    
    localStorage.setItem(RATINGS_KEY, JSON.stringify(allRatings));
  } catch (error) {
    console.error('Failed to save rating:', error);
  }
};

export const exportRatings = (galleryId: string, galleryName: string, photos: Photo[]): void => {
  try {
    const ratingGroups: { [key: number]: string[] } = {
      5: [],
      4: [],
      3: [],
      2: [],
      1: []
    };
    
    photos.forEach((photo, index) => {
      const avgRating = Math.round(photo.averageRating || 0);
      if (avgRating > 0) {
        ratingGroups[avgRating].push(`${index + 1}. ${photo.name}`);
      }
    });
    
    let csvContent = `Gallery: ${galleryName}\nExported: ${new Date().toLocaleString()}\n\n`;
    
    [5, 4, 3, 2, 1].forEach(stars => {
      csvContent += `${stars} Star${stars !== 1 ? 's' : ''} (${ratingGroups[stars].length} photos):\n`;
      if (ratingGroups[stars].length > 0) {
        csvContent += ratingGroups[stars].join('\n') + '\n';
      } else {
        csvContent += 'No photos\n';
      }
      csvContent += '\n';
    });
    
    const blob = new Blob([csvContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${galleryName.replace(/[^a-z0-9]/gi, '_')}_ratings.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to export ratings:', error);
  }
};