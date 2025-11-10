// Constants untuk aplikasi Vintify

export const GENRES = [
  'Pop',
  'Rock',
  'Hip Hop',
  'Electronic',
  'Jazz',
  'Classical',
  'R&B',
  'Country',
  'Indie',
  'Other'
] as const;

export type Genre = typeof GENRES[number];

export const AUDIO_FILE_TYPES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/ogg',
  'audio/m4a'
] as const;

export const AUDIO_FILE_EXTENSIONS = ['.mp3', '.wav', '.ogg', '.m4a'] as const;

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB in bytes

export const PROGRESS_UPDATE_INTERVAL = 100; // milliseconds

export const DEFAULT_VOLUME = 0.7;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  LIBRARY: '/library',
  UPLOAD: '/upload',
  SEARCH: '/search',
  FORGOT_PASSWORD: '/forgot-password'
} as const;

export const API_ENDPOINTS = {
  SONGS: '/api/songs',
  SONGS_BY_ID: (id: string) => `/api/songs/${id}`,
  CLOUDINARY_SIGNATURE: '/api/cloudinary/signature'
} as const;

