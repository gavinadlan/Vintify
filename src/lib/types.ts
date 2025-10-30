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
