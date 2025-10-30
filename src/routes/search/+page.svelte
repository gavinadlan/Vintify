<script lang="ts">
  import { onMount } from 'svelte';
  import { auth, db } from '$lib/firebase/config';
  import { collection, getDocs, query, orderBy } from 'firebase/firestore';
  import { goto } from '$app/navigation';
  import { playSong } from '$lib/stores/player';
  import type { Song } from '$lib/types';
  import MusicPlayer from '$lib/components/MusicPlayer.svelte';

  let user: any = null;
  let allSongs: Song[] = [];
  let filteredSongs: Song[] = [];
  let searchQuery = '';
  let selectedGenre = '';
  let loading = true;

  onMount(async () => {
    user = auth.currentUser;
    if (!user) {
      goto('/login');
      return;
    }
    await loadAllSongs();
  });

  async function loadAllSongs() {
    loading = true;
    try {
      const q = query(collection(db, 'songs'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      allSongs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Song));
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

  $: {
    searchQuery;
    selectedGenre;
    handleSearch();
  }

  const genres = ['Pop', 'Rock', 'Hip Hop', 'Electronic', 'Jazz', 'Classical', 'R&B', 'Country', 'Indie', 'Other'];
</script>

<svelte:head>
  <title>Search - Vintify</title>
</svelte:head>

<div class="min-h-screen bg-gray-900 py-8 px-4 pb-32">
  <div class="max-w-7xl mx-auto">
    <h1 class="text-4xl font-bold text-white mb-8">Search Music</h1>

    <!-- Search Controls -->
    <div class="bg-gray-800 rounded-lg p-6 mb-8">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label for="search" class="block text-sm font-medium text-gray-300 mb-2">
            Search by title, artist, or description
          </label>
          <input
            type="text"
            id="search"
            bind:value={searchQuery}
            placeholder="Search songs..."
            class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
          />
        </div>

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
      </div>

      <div class="mt-4 text-sm text-gray-400">
        Found {filteredSongs.length} {filteredSongs.length === 1 ? 'song' : 'songs'}
      </div>
    </div>

    <!-- Results -->
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

    <!-- Back to Library -->
    <div class="mt-8">
      <a href="/library" class="text-orange-500 hover:text-orange-400 font-medium">
        ← Back to My Library
      </a>
    </div>
  </div>
</div>

<MusicPlayer />
