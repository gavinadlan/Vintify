<script lang="ts">
  import { onMount } from 'svelte';
  import { auth } from '$lib/firebase/config';
  import { onAuthStateChanged } from 'firebase/auth';
  import { goto } from '$app/navigation';
  import { playSong } from '$lib/stores/player';
  import type { Song } from '$lib/types';
  import MusicPlayer from '$lib/components/MusicPlayer.svelte';
  import Navbar from '$lib/components/Navbar.svelte';
  import type { SpotifyTrack } from '$lib/services/spotify-service';

  let user: any = null;
  let allSongs: Song[] = [];
  let filteredSongs: Song[] = [];
  let searchQuery = '';
  let selectedGenre = '';
  let loading = true;
  
  // Spotify search state
  let searchMode: 'library' | 'spotify' = 'library';
  let spotifyTracks: SpotifyTrack[] = [];
  let spotifyLoading = false;
  let spotifyError = '';
  let addingToLibrary: string | null = null;
  let showOnlyWithPreview = true; // Default: only show tracks with preview

  onMount(() => {
    if (!auth) { goto('/login'); return; }
    const unsubscribe = onAuthStateChanged(auth as any, async (currentUser) => {
      if (!currentUser) {
        goto('/login');
        return;
      }
      user = currentUser;
      await loadAllSongs();
    });
    return unsubscribe;
  });

  async function loadAllSongs() {
    loading = true;
    try {
      const res = await fetch('/api/songs');
      if (!res.ok) {
        let details = '';
        try { const j = await res.json(); details = j?.details || j?.error || ''; } catch {}
        throw new Error(`Server fetch failed${details ? ': ' + details : ''}`);
      }
      const data = await res.json();
      allSongs = (data.songs || []) as Song[];
      filteredSongs = allSongs;
    } catch (error) {
      console.error('Error loading songs:', error);
    } finally {
      loading = false;
    }
  }

  function handleSearch() {
    filteredSongs = allSongs.filter(song => {
      const matchesQuery = !searchQuery || 
        song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (song.description && song.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesGenre = !selectedGenre || song.genre === selectedGenre;
      
      return matchesQuery && matchesGenre;
    });
  }

  function handlePlay(song: Song) {
    playSong(song, filteredSongs);
  }

  async function searchSpotify() {
    if (!searchQuery.trim()) {
      spotifyTracks = [];
      return;
    }

    spotifyLoading = true;
    spotifyError = '';

    try {
      console.log('Searching Spotify for:', searchQuery);
      const res = await fetch(`/api/spotify/search?q=${encodeURIComponent(searchQuery)}&limit=50`);
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Spotify API error response:', {
          status: res.status,
          statusText: res.statusText,
          errorData
        });
        const error = new Error(errorData.error || errorData.details || 'Failed to search Spotify');
        (error as any).details = errorData.details;
        throw error;
      }
      
      const data = await res.json();
      let allTracks = data.tracks || [];
      
      console.log('Spotify search results:', {
        totalTracks: allTracks.length,
        tracksWithPreview: allTracks.filter((t: SpotifyTrack) => t.preview_url).length,
        showOnlyWithPreview,
        firstTrack: allTracks[0] ? { name: allTracks[0].name, hasPreview: !!allTracks[0].preview_url } : null
      });
      
      if (allTracks.length === 0) {
        console.warn('Spotify returned 0 tracks for query:', searchQuery);
        spotifyError = 'No tracks found. Try a different search query or uncheck "Show only tracks with preview" to see all results.';
        spotifyTracks = [];
        return;
      }
      
      // Store all tracks first (for filtering later)
      spotifyTracks = allTracks;
      
      // Filter will be applied by computed property filteredSpotifyTracks
    } catch (err: any) {
      console.error('Spotify search error:', err);
      let errorMessage = err.message || 'Failed to search Spotify';
      
      // Parse error details if available
      if (err.details) {
        errorMessage = err.details;
      }
      
      // Add helpful message for common errors
      if (errorMessage.includes('not configured')) {
        errorMessage += '. Pastikan sudah restart server setelah update .env file.';
      } else if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
        errorMessage = 'Spotify credentials invalid. Please check your Client ID and Client Secret.';
      } else if (errorMessage.includes('403') || errorMessage.includes('Forbidden')) {
        errorMessage = 'Spotify API access denied. Check your app permissions in Spotify Dashboard.';
      }
      
      spotifyError = errorMessage;
      spotifyTracks = [];
    } finally {
      spotifyLoading = false;
    }
  }

  // Re-filter when checkbox changes (client-side filter on existing results)
  function handlePreviewFilterChange() {
    // Just filter the existing results without re-fetching
    if (showOnlyWithPreview && spotifyTracks.length > 0) {
      // Filter is already applied in searchSpotify, but we need to re-apply if we have cached results
      // Actually, let's just re-run the search to get more results
      if (searchQuery.trim()) {
        searchSpotify();
      }
    }
  }

  // Computed property for filtered tracks
  $: filteredSpotifyTracks = showOnlyWithPreview 
    ? spotifyTracks.filter((track: SpotifyTrack) => track.preview_url)
    : spotifyTracks;

  async function addSpotifyTrackToLibrary(track: SpotifyTrack) {
    if (!user) {
      alert('You must be logged in to add songs');
      return;
    }

    addingToLibrary = track.id;

    try {
      // Convert Spotify track to Song format
      // Only save if preview_url exists, otherwise warn user
      if (!track.preview_url) {
        alert('Track ini tidak memiliki preview audio. Hanya track dengan preview 30 detik yang bisa diputar di aplikasi ini. Silakan buka di Spotify untuk mendengarkan full track.');
        addingToLibrary = null;
        return;
      }

      const songData = {
        title: track.name,
        artist: track.artists.map(a => a.name).join(', '),
        genre: 'Pop', // Default, bisa diubah nanti
        description: `From Spotify - ${track.album.name} (30s preview)`,
        albumArt: track.album.images[0]?.url || track.album.images[1]?.url || '',
        audioUrl: track.preview_url, // Only use preview_url
        userId: user.uid,
        createdAt: Date.now(),
        sourceType: 'external',
        externalId: track.id,
        externalSource: 'spotify'
      };

      const res = await fetch('/api/songs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(songData)
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to add song to library');
      }

      // Reload library songs
      await loadAllSongs();
      alert(`"${track.name}" berhasil ditambahkan ke library!`);
    } catch (err: any) {
      console.error('Error adding track:', err);
      alert('Gagal menambahkan lagu: ' + (err.message || 'Unknown error'));
    } finally {
      addingToLibrary = null;
    }
  }

  function formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  let spotifySearchTimeout: ReturnType<typeof setTimeout> | null = null;

  $: {
    if (searchMode === 'library') {
      searchQuery;
      selectedGenre;
      handleSearch();
    } else if (searchMode === 'spotify') {
      // Clear previous timeout
      if (spotifySearchTimeout) {
        clearTimeout(spotifySearchTimeout);
      }
      // Debounce Spotify search
      if (searchQuery.trim()) {
        spotifySearchTimeout = setTimeout(() => {
          searchSpotify();
        }, 500);
      } else {
        spotifyTracks = [];
      }
    }
  }


  const genres = ['Pop', 'Rock', 'Hip Hop', 'Electronic', 'Jazz', 'Classical', 'R&B', 'Country', 'Indie', 'Other'];
</script>

<svelte:head>
  <title>Search - Vintify</title>
</svelte:head>

<Navbar {user} />

  <div class="min-h-screen bg-gray-900 py-8 px-4 pb-32">
  <div class="max-w-7xl mx-auto">
    <h1 class="text-4xl font-bold text-white mb-8">Search Music</h1>

    <!-- Search Mode Tabs -->
    <div class="mb-6 flex gap-4 border-b border-gray-700">
      <button
        on:click={() => { searchMode = 'library'; searchQuery = ''; }}
        class="pb-4 px-4 font-semibold transition"
        class:text-orange-500={searchMode === 'library'}
        class:text-gray-400={searchMode !== 'library'}
        class:border-b-2={searchMode === 'library'}
        class:border-orange-500={searchMode === 'library'}
      >
        My Library
      </button>
      <button
        on:click={() => { searchMode = 'spotify'; searchQuery = ''; spotifyTracks = []; }}
        class="pb-4 px-4 font-semibold transition"
        class:text-orange-500={searchMode === 'spotify'}
        class:text-gray-400={searchMode !== 'spotify'}
        class:border-b-2={searchMode === 'spotify'}
        class:border-orange-500={searchMode === 'spotify'}
      >
        <span class="flex items-center gap-2">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
          Spotify
        </span>
      </button>
    </div>

    <!-- Search Controls -->
    <div class="bg-gray-800 rounded-lg p-6 mb-8">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label for="search" class="block text-sm font-medium text-gray-300 mb-2">
            {#if searchMode === 'library'}
              Search by title, artist, or description
            {:else}
              Search on Spotify
            {/if}
          </label>
          <input
            type="text"
            id="search"
            bind:value={searchQuery}
            placeholder={searchMode === 'library' ? 'Search songs...' : 'Search on Spotify...'}
            class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
          />
        </div>

        {#if searchMode === 'library'}
          <div>
            <label for="genre" class="block text-sm font-medium text-gray-300 mb-2">
              Filter by genre
            </label>
            <select
              id="genre"
              bind:value={selectedGenre}
              class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
            >
              <option value="">All Genres</option>
              {#each genres as genre}
                <option value={genre}>{genre}</option>
              {/each}
            </select>
          </div>
        {:else}
          <div class="flex items-center gap-2">
            <input
              type="checkbox"
              id="preview-only"
              bind:checked={showOnlyWithPreview}
              on:change={handlePreviewFilterChange}
              class="w-4 h-4 text-orange-500 bg-gray-700 border-gray-600 rounded focus:ring-orange-500"
            />
            <label for="preview-only" class="text-sm text-gray-300 cursor-pointer">
              Show only tracks with preview
            </label>
          </div>
        {/if}
      </div>

      <div class="mt-4 space-y-2">
        <div class="text-sm text-gray-400">
          {#if searchMode === 'library'}
            Found {filteredSongs.length} {filteredSongs.length === 1 ? 'song' : 'songs'}
          {:else}
            {#if spotifyLoading}
              Searching Spotify...
            {:else if spotifyError}
              <span class="text-red-400">{spotifyError}</span>
            {:else}
              Found {filteredSpotifyTracks.length} {filteredSpotifyTracks.length === 1 ? 'track' : 'tracks'} on Spotify
              {#if spotifyTracks.length > 0 && !showOnlyWithPreview}
                ({spotifyTracks.filter((t: SpotifyTrack) => t.preview_url).length} with preview available)
              {/if}
            {/if}
          {/if}
        </div>
        {#if searchMode === 'spotify' && spotifyTracks.length > 0}
          <div class="text-xs text-gray-500 bg-gray-700/50 px-3 py-2 rounded">
            <span class="font-semibold">Note:</span> Not all Spotify tracks have 30-second previews. 
            Tracks without preview can only be opened in Spotify app. 
            {#if !showOnlyWithPreview}
              Enable "Show only tracks with preview" to filter results.
            {/if}
          </div>
        {/if}
      </div>
    </div>

    <!-- Results -->
    {#if searchMode === 'library'}
      {#if loading}
        <div class="flex justify-center items-center py-20">
          <div class="text-gray-400">Loading songs...</div>
        </div>
      {:else if filteredSongs.length === 0}
        <div class="text-center py-20">
          <svg class="w-20 h-20 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h2 class="text-2xl font-semibold text-white mb-2">No songs found</h2>
          <p class="text-gray-400">Try adjusting your search criteria</p>
        </div>
      {:else}
        <div class="grid grid-cols-1 gap-4">
          {#each filteredSongs as song (song.id)}
            <div class="bg-gray-800 rounded-lg p-4 flex items-center gap-4 hover:bg-gray-750 transition">
              <!-- Album Art -->
              <div class="w-16 h-16 bg-gray-700 rounded flex-shrink-0 overflow-hidden">
                {#if song.albumArt}
                  <img src={song.albumArt} alt={song.title} class="w-full h-full object-cover" />
                {:else}
                  <div class="w-full h-full flex items-center justify-center text-gray-500">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                  </div>
                {/if}
              </div>

              <!-- Song Info -->
              <div class="flex-1 min-w-0">
                <h3 class="text-white font-semibold truncate">{song.title}</h3>
                <p class="text-gray-400 text-sm truncate">{song.artist} • {song.genre}</p>
                {#if song.description}
                  <p class="text-gray-500 text-xs truncate mt-1">{song.description}</p>
                {/if}
              </div>

              <!-- Play Button -->
              <button
                on:click={() => handlePlay(song)}
                class="p-2 bg-orange-500 hover:bg-orange-600 text-white rounded-full transition flex-shrink-0"
                title="Play"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </button>
            </div>
          {/each}
        </div>
      {/if}
    {:else}
      <!-- Spotify Results -->
      {#if spotifyLoading}
        <div class="flex justify-center items-center py-20">
          <div class="text-gray-400">Searching Spotify...</div>
        </div>
      {:else if spotifyError}
        <div class="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded mb-6">
          {spotifyError}
        </div>
      {:else if filteredSpotifyTracks.length === 0 && searchQuery.trim()}
        <div class="text-center py-20">
          <svg class="w-20 h-20 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h2 class="text-2xl font-semibold text-white mb-2">
            {#if showOnlyWithPreview && spotifyTracks.length > 0}
              No tracks with preview found
            {:else}
              No tracks found
            {/if}
          </h2>
          <p class="text-gray-400">
            {#if showOnlyWithPreview && spotifyTracks.length > 0}
              Try unchecking "Show only tracks with preview" to see all results
            {:else}
              Try a different search query
            {/if}
          </p>
        </div>
      {:else if filteredSpotifyTracks.length > 0}
        <div class="grid grid-cols-1 gap-4">
          {#each filteredSpotifyTracks as track (track.id)}
            <div class="bg-gray-800 rounded-lg p-4 flex items-center gap-4 hover:bg-gray-750 transition">
              <!-- Album Art -->
              <div class="w-16 h-16 bg-gray-700 rounded flex-shrink-0 overflow-hidden">
                {#if track.album.images[0]?.url}
                  <img src={track.album.images[0].url} alt={track.name} class="w-full h-full object-cover" />
                {:else}
                  <div class="w-full h-full flex items-center justify-center text-gray-500">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                  </div>
                {/if}
              </div>

              <!-- Track Info -->
              <div class="flex-1 min-w-0">
                <h3 class="text-white font-semibold truncate">{track.name}</h3>
                <p class="text-gray-400 text-sm truncate">
                  {track.artists.map(a => a.name).join(', ')} • {track.album.name}
                </p>
                <div class="flex items-center gap-2 mt-1">
                  <p class="text-gray-500 text-xs">{formatDuration(track.duration_ms)}</p>
                  {#if track.preview_url}
                    <span class="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded">30s preview</span>
                  {:else}
                    <span class="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded">No preview</span>
                  {/if}
                </div>
              </div>

              <!-- Actions -->
              <div class="flex gap-2">
                <button
                  on:click={() => addSpotifyTrackToLibrary(track)}
                  disabled={addingToLibrary === track.id || !track.preview_url}
                  class="p-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded transition flex-shrink-0"
                  title={track.preview_url ? "Add to Library (30s preview)" : "No preview available"}
                >
                  {#if addingToLibrary === track.id}
                    <svg class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  {:else}
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                  {/if}
                </button>
                {#if track.preview_url}
                  <a
                    href={track.external_urls.spotify}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition flex-shrink-0"
                    title="Open in Spotify"
                  >
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
                    </svg>
                  </a>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      {:else}
        <div class="text-center py-20">
          <svg class="w-20 h-20 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h2 class="text-2xl font-semibold text-white mb-2">Search Spotify</h2>
          <p class="text-gray-400">Enter a search query to find tracks on Spotify</p>
        </div>
      {/if}
    {/if}

    <!-- Back to Library -->
    <div class="mt-8">
      <a href="/library" class="text-orange-500 hover:text-orange-400 font-medium">
        ← Back to My Library
      </a>
    </div>
  </div>
</div>

<MusicPlayer />
