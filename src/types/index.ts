export interface Photo {
  id: string;
  url: string;
  thumbnail: string;
  name: string;
  ratings: Rating[];
  averageRating?: number;
}

export interface Rating {
  userId: string;
  stars: number;
  timestamp: number;
}

export interface Gallery {
  id: string;
  name: string;
  password: string;
  photos: Photo[];
  createdAt: number;
}

export interface User {
  id: string;
  role: 'admin' | 'viewer';
  galleryId?: string;
}

export interface StarFilter {
  stars: number;
  active: boolean;
}