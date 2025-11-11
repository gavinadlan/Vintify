export interface Song {
  id: string;
  title: string;
  artist: string;
  genre: string;
  description?: string;
  albumArt?: string;
  albumArtPath?: string;
  audioUrl: string;
  audioPath: string;
  userId: string;
  createdAt: number;
  duration?: number;
  // External source fields (for Spotify, etc.)
  sourceType?: 'upload' | 'external';
  externalId?: string;
  externalSource?: string; // 'spotify', 'youtube', etc.
}

export interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  volume: number;
  progress: number;
  duration: number;
  queue: Song[];
  currentIndex: number;
  shuffle: boolean;
  repeat: boolean;
}
