<script lang="ts">
  import { onMount } from 'svelte';
  import { auth } from '$lib/firebase/config';
  import { onAuthStateChanged, type User } from 'firebase/auth';
  import Navbar from '$lib/components/Navbar.svelte';
  import MusicPlayer from '$lib/components/MusicPlayer.svelte';

  let user: User | null = null;

  onMount(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      user = currentUser;
    });
    return unsubscribe;
  });
</script>

<div class="min-h-screen bg-gray-900">
  <Navbar {user} />
  
  {#if user}
    <div class="container mx-auto px-4 py-8 pb-32">
      <h1 class="text-4xl font-bold text-white mb-2">Welcome to Vintify</h1>
      <p class="text-gray-400 mb-8">Your personal music streaming platform</p>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <a href="/library" class="bg-gray-800 p-6 rounded-lg hover:bg-gray-700 transition">
          <h2 class="text-2xl font-semibold text-white mb-2">My Library</h2>
          <p class="text-gray-400">Browse and play your music</p>
        </a>
        <a href="/upload" class="bg-gray-800 p-6 rounded-lg hover:bg-gray-700 transition">
          <h2 class="text-2xl font-semibold text-white mb-2">Upload Music</h2>
          <p class="text-gray-400">Add new songs to your collection</p>
        </a>
        <a href="/search" class="bg-gray-800 p-6 rounded-lg hover:bg-gray-700 transition">
          <h2 class="text-2xl font-semibold text-white mb-2">Search</h2>
          <p class="text-gray-400">Find songs and artists</p>
        </a>
      </div>
    </div>
  {:else}
    <div class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <h1 class="text-6xl font-bold text-white mb-4">Vintify</h1>
        <p class="text-xl text-gray-400 mb-8">Stream, Upload, Discover Music</p>
        <div class="space-x-4">
          <a href="/login" class="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3 rounded-lg inline-block transition">
            Login
          </a>
          <a href="/register" class="bg-gray-800 hover:bg-gray-700 text-white font-semibold px-8 py-3 rounded-lg inline-block transition">
            Register
          </a>
        </div>
      </div>
    </div>
  {/if}
</div>

<MusicPlayer />
