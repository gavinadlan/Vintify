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

    // Debug logging (remove in production)
    console.log('Spotify credentials check:', {
      hasClientId: !!clientId,
      hasClientSecret: !!clientSecret,
      clientIdLength: clientId?.length || 0
    });

    // Check if credentials are configured
    if (!clientId || !clientSecret) {
      console.error('Spotify credentials missing:', {
        SPOTIFY_CLIENT_ID: clientId ? 'present' : 'missing',
        SPOTIFY_CLIENT_SECRET: clientSecret ? 'present' : 'missing'
      });
      return json(
        { 
          error: 'Spotify API not configured', 
          details: 'Please set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET environment variables in .env file. Make sure to restart the server after updating .env file.' 
        },
        { status: 500 }
      );
    }

    console.log('Calling Spotify API with query:', query, 'limit:', limit);
    const tracks = await spotifyService.searchTracks(query, limit, clientId, clientSecret);
    console.log('Spotify API returned', tracks.length, 'tracks');
    return json({ tracks });
  } catch (err: any) {
    console.error('Spotify search error:', err);
    const errorMessage = err?.message || String(err);
    return json(
      { 
        error: 'Failed to search Spotify', 
        details: errorMessage,
        // Include more details for debugging
        ...(err?.code && { code: err.code })
      },
      { status: 500 }
    );
  }
};

