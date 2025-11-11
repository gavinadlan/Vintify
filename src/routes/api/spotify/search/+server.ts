import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { spotifyService } from '$lib/services/spotify-service';
import { env } from '$env/dynamic/private';

export const GET: RequestHandler = async ({ url }) => {
  try {
    const query = url.searchParams.get('q');
    const limit = parseInt(url.searchParams.get('limit') || '20');

    if (!query || query.trim() === '') {
      return json({ error: 'Query parameter "q" is required' }, { status: 400 });
    }

    // Get credentials from environment variables
    const clientId = env.SPOTIFY_CLIENT_ID;
    const clientSecret = env.SPOTIFY_CLIENT_SECRET;

    // Check if credentials are configured
    if (!clientId || !clientSecret) {
      return json(
        { 
          error: 'Spotify API not configured', 
          details: 'Please set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET environment variables in .env file' 
        },
        { status: 500 }
      );
    }

    const tracks = await spotifyService.searchTracks(query, limit, clientId, clientSecret);
    return json({ tracks });
  } catch (err: any) {
    console.error('Spotify search error:', err);
    return json(
      { error: 'Failed to search Spotify', details: err?.message ?? String(err) },
      { status: 500 }
    );
  }
};

