// Song Service - abstraction layer untuk song operations

import { apiClient } from './api-client';
import { API_ENDPOINTS } from '../utils/constants';
import type { Song } from '../types';

export interface CreateSongData {
  title: string;
  artist: string;
  genre: string;
  description?: string;
  albumArt?: string;
  albumArtPublicId?: string;
  audioUrl: string;
  audioPublicId?: string;
  userId: string;
  createdAt: number;
}

export interface UpdateSongData {
  title?: string;
  artist?: string;
  genre?: string;
  description?: string;
  albumArt?: string;
  albumArtPublicId?: string;
  audioUrl?: string;
  audioPublicId?: string;
}

export interface SongsResponse {
  songs: Song[];
}

export class SongService {
  async getAllSongs(): Promise<Song[]> {
    const response = await apiClient.get<SongsResponse>(API_ENDPOINTS.SONGS);
    return response.songs || [];
  }

  async getSongsByUserId(userId: string): Promise<Song[]> {
    const response = await apiClient.get<SongsResponse>(
      `${API_ENDPOINTS.SONGS}?userId=${encodeURIComponent(userId)}`
    );
    return response.songs || [];
  }

  async createSong(data: CreateSongData): Promise<{ id: string }> {
    return apiClient.post<{ id: string }>(API_ENDPOINTS.SONGS, data);
  }

  async updateSong(id: string, data: UpdateSongData): Promise<{ ok: boolean }> {
    return apiClient.patch<{ ok: boolean }>(API_ENDPOINTS.SONGS_BY_ID(id), data);
  }

  async deleteSong(id: string): Promise<{ ok: boolean }> {
    return apiClient.delete<{ ok: boolean }>(API_ENDPOINTS.SONGS_BY_ID(id));
  }

  searchSongs(songs: Song[], query: string, genre?: string): Song[] {
    const lowerQuery = query.toLowerCase().trim();
    
    return songs.filter(song => {
      const matchesQuery = !lowerQuery || 
        song.title.toLowerCase().includes(lowerQuery) ||
        song.artist.toLowerCase().includes(lowerQuery) ||
        (song.description && song.description.toLowerCase().includes(lowerQuery));
      
      const matchesGenre = !genre || song.genre === genre;
      
      return matchesQuery && matchesGenre;
    });
  }
}

// Singleton instance
export const songService = new SongService();

