// Spotify Service - untuk integrasi dengan Spotify Web API
// Note: Service ini digunakan di server-side untuk keamanan credentials

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: {
    name: string;
    images: Array<{ url: string }>;
  };
  duration_ms: number;
  preview_url: string | null;
  external_urls: {
    spotify: string;
  };
}

export interface SpotifySearchResponse {
  tracks: {
    items: SpotifyTrack[];
    total: number;
  };
}

export interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export class SpotifyService {
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  /**
   * Get access token menggunakan Client Credentials Flow
   * Ini untuk search dan fetch data, tidak perlu user login
   * Harus dipanggil dari server-side untuk keamanan
   */
  async getAccessToken(clientId?: string, clientSecret?: string): Promise<string> {
    // Jika token masih valid, return yang ada
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    // Ambil credentials dari parameter atau environment variables (server-side only)
    const SPOTIFY_CLIENT_ID = clientId || (typeof process !== 'undefined' ? process.env.SPOTIFY_CLIENT_ID : '') || '';
    const SPOTIFY_CLIENT_SECRET = clientSecret || (typeof process !== 'undefined' ? process.env.SPOTIFY_CLIENT_SECRET : '') || '';

    if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
      throw new Error('Spotify credentials not configured. Please set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET environment variables.');
    }

    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`
        },
        body: 'grant_type=client_credentials'
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to get Spotify token: ${error}`);
      }

      const data = (await response.json()) as SpotifyTokenResponse;
      this.accessToken = data.access_token;
      // Set expiry sedikit lebih awal untuk safety margin
      this.tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;

      return this.accessToken;
    } catch (error) {
      console.error('Spotify token error:', error);
      throw error;
    }
  }

  /**
   * Search tracks di Spotify
   */
  async searchTracks(query: string, limit: number = 20, clientId?: string, clientSecret?: string): Promise<SpotifyTrack[]> {
    try {
      console.log('Getting Spotify access token...');
      const token = await this.getAccessToken(clientId, clientSecret);
      console.log('Access token obtained, searching for:', query);
      
      const encodedQuery = encodeURIComponent(query);
      const url = `https://api.spotify.com/v1/search?q=${encodedQuery}&type=track&limit=${limit}`;

      console.log('Fetching from Spotify API:', url);
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Spotify API error response:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        throw new Error(`Spotify API error (${response.status}): ${errorText}`);
      }

      const data = (await response.json()) as SpotifySearchResponse;
      console.log('Spotify API response:', {
        total: data.tracks?.total || 0,
        items: data.tracks?.items?.length || 0
      });
      return data.tracks.items || [];
    } catch (error) {
      console.error('Spotify search error:', error);
      throw error;
    }
  }

  /**
   * Get track details by ID
   */
  async getTrack(trackId: string): Promise<SpotifyTrack> {
    try {
      const token = await this.getAccessToken();
      const url = `https://api.spotify.com/v1/tracks/${trackId}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Spotify API error: ${error}`);
      }

      return (await response.json()) as SpotifyTrack;
    } catch (error) {
      console.error('Spotify get track error:', error);
      throw error;
    }
  }

  /**
   * Convert Spotify track ke format Song untuk aplikasi
   */
  convertToSong(track: SpotifyTrack, userId: string, genre: string = 'Pop'): {
    title: string;
    artist: string;
    genre: string;
    description?: string;
    albumArt?: string;
    audioUrl: string;
    userId: string;
    createdAt: number;
    sourceType: 'external';
    externalId: string;
    externalSource: 'spotify';
  } {
    return {
      title: track.name,
      artist: track.artists.map(a => a.name).join(', '),
      genre,
      description: `From Spotify - ${track.album.name}`,
      albumArt: track.album.images[0]?.url || track.album.images[1]?.url,
      // Gunakan preview_url jika ada, atau external URL sebagai fallback
      audioUrl: track.preview_url || track.external_urls.spotify,
      userId,
      createdAt: Date.now(),
      sourceType: 'external',
      externalId: track.id,
      externalSource: 'spotify'
    };
  }
}

// Singleton instance
export const spotifyService = new SpotifyService();

