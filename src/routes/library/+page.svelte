<script lang="ts">
  import { onMount } from 'svelte';
  import { auth } from '$lib/firebase/config';
  import { goto } from '$app/navigation';
  import { playSong } from '$lib/stores/player';
  import type { Song } from '$lib/types';
  import MusicPlayer from '$lib/components/MusicPlayer.svelte';
  import Navbar from '$lib/components/Navbar.svelte';

  import { onAuthStateChanged } from 'firebase/auth';

  let user: any = null;
  let songs: Song[] = [];
  let loading = true;
  let editingSong: Song | null = null;
  let editForm = { title: '', artist: '', genre: '', description: '' };

  onMount(() => {
    if (!auth) { goto('/login'); return; }
    const unsubscribe = onAuthStateChanged(auth as any, async (currentUser) => {
      if (!currentUser) {
        goto('/login');
        return;
      }
      user = currentUser;
      await loadSongs();
    });
    return unsubscribe;
  });

  async function loadSongs() {
    if (!user) return;
    
    loading = true;
    try {
      const res = await fetch(`/api/songs?userId=${encodeURIComponent(user.uid)}`);
      if (!res.ok) {
        let details = '';
        try { const j = await res.json(); details = j?.details || j?.error || ''; } catch {}
        throw new Error(`Server fetch failed${details ? ': ' + details : ''}`);
      }
      const data = await res.json();
      songs = (data.songs || []) as Song[];
    } catch (error) {
      console.error('Error loading songs:', error);
    } finally {
      loading = false;
    }
  }

  function handlePlay(song: Song) {
    playSong(song, songs);
  }

  function handlePlayAll() {
    if (songs.length > 0) {
      playSong(songs[0], songs);
    }
  }

  function startEdit(song: Song) {
    editingSong = song;
    editForm = {
      title: song.title,
      artist: song.artist,
      genre: song.genre,
      description: song.description || ''
    };
  }

  function cancelEdit() {
    editingSong = null;
  }

  async function saveEdit() {
    if (!editingSong) return;

    try {
      const res = await fetch(`/api/songs/${encodeURIComponent(editingSong!.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      if (!res.ok) throw new Error('Server update failed');
      
      const songIndex = songs.findIndex(s => s.id === editingSong!.id);
      if (songIndex !== -1) {
        songs[songIndex] = { ...songs[songIndex], ...editForm };
        songs = songs;
      }
      
      editingSong = null;
    } catch (error) {
      console.error('Error updating song:', error);
      alert('Failed to update song');
    }
  }

  async function deleteSong(song: Song) {
    if (!confirm(`Are you sure you want to delete "${song.title}"?`)) return;

    try {
      // Files are on Cloudinary now; deletion of media is handled out of scope here.

      const res = await fetch(`/api/songs/${encodeURIComponent(song.id)}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Server delete failed');
      songs = songs.filter(s => s.id !== song.id);
    } catch (error) {
      console.error('Error deleting song:', error);
      alert('Failed to delete song');
    }
  }

</script>

<svelte:head>
  <title>My Library - Vintify</title>
</svelte:head>

<Navbar {user} />

<div class="min-h-screen bg-gray-900 py-8 px-4 pb-32">
  <div class="max-w-7xl mx-auto">
    <!-- Header -->
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-4xl font-bold text-white mb-2">My Library</h1>
        <p class="text-gray-400">{songs.length} {songs.length === 1 ? 'song' : 'songs'}</p>
      </div>
      <div class="flex gap-4">
        <a href="/upload" class="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition">
          Upload Music
        </a>
        <a href="/search" class="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition">
          Search
        </a>
      </div>
    </div>

    {#if loading}
      <div class="flex justify-center items-center py-20">
        <div class="text-gray-400">Loading your music...</div>
      </div>
    {:else if songs.length === 0}
      <div class="text-center py-20">
        <svg class="w-20 h-20 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
        <h2 class="text-2xl font-semibold text-white mb-2">No music yet</h2>
        <p class="text-gray-400 mb-6">Start building your library by uploading your first song</p>
        <a href="/upload" class="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold inline-block transition">
          Upload Your First Song
        </a>
      </div>
    {:else}
      <div class="mb-4">
        <button
          on:click={handlePlayAll}
          class="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition"
        >
          Play All
        </button>
      </div>

      <div class="grid grid-cols-1 gap-4">
        {#each songs as song (song.id)}
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
            </div>

            <!-- Actions -->
            <div class="flex gap-2">
              <button
                on:click={() => handlePlay(song)}
                class="p-2 bg-orange-500 hover:bg-orange-600 text-white rounded-full transition"
                title="Play"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </button>
              <button
                on:click={() => startEdit(song)}
                class="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition"
                title="Edit"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                on:click={() => deleteSong(song)}
                class="p-2 bg-red-600 hover:bg-red-700 text-white rounded transition"
                title="Delete"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<!-- Edit Modal -->
{#if editingSong}
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
    <div class="bg-gray-800 rounded-lg p-6 max-w-md w-full">
      <h2 class="text-2xl font-bold text-white mb-4">Edit Song</h2>
      
      <div class="space-y-4">
        <div>
          <label for="edit-title" class="block text-sm font-medium text-gray-300 mb-2">Title</label>
          <input
            id="edit-title"
            type="text"
            bind:value={editForm.title}
            class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
          />
        </div>
        
        <div>
          <label for="edit-artist" class="block text-sm font-medium text-gray-300 mb-2">Artist</label>
          <input
            id="edit-artist"
            type="text"
            bind:value={editForm.artist}
            class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
          />
        </div>
        
        <div>
          <label for="edit-genre" class="block text-sm font-medium text-gray-300 mb-2">Genre</label>
          <select
            id="edit-genre"
            bind:value={editForm.genre}
            class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
          >
            <option value="Pop">Pop</option>
            <option value="Rock">Rock</option>
            <option value="Hip Hop">Hip Hop</option>
            <option value="Electronic">Electronic</option>
            <option value="Jazz">Jazz</option>
            <option value="Classical">Classical</option>
            <option value="R&B">R&B</option>
            <option value="Country">Country</option>
            <option value="Indie">Indie</option>
            <option value="Other">Other</option>
          </select>
        </div>
        
        <div>
          <label for="edit-description" class="block text-sm font-medium text-gray-300 mb-2">Description</label>
          <textarea
            id="edit-description"
            bind:value={editForm.description}
            rows="3"
            class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
          ></textarea>
        </div>
      </div>
      
      <div class="flex gap-4 mt-6">
        <button
          on:click={saveEdit}
          class="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg font-semibold transition"
        >
          Save
        </button>
        <button
          on:click={cancelEdit}
          class="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg font-semibold transition"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
{/if}

<MusicPlayer />
