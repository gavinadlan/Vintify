<script lang="ts">
  import { auth } from '$lib/firebase/config';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import type { User } from 'firebase/auth';

  export let user: User | null = null;

  async function handleLogout() {
    await auth.signOut();
    goto('/');
  }
</script>

{#if user}
  <nav class="bg-gray-800 border-b border-gray-700">
    <div class="max-w-7xl mx-auto px-4">
      <div class="flex justify-between items-center h-16">
        <a href="/" class="text-2xl font-bold text-orange-500">Vintify</a>
        
        <div class="flex gap-6 items-center">
          <a href="/library" class="text-gray-300 hover:text-white transition">Library</a>
          <a href="/upload" class="text-gray-300 hover:text-white transition">Upload</a>
          <a href="/search" class="text-gray-300 hover:text-white transition">Search</a>
          <button
            on:click={handleLogout}
            class="text-gray-300 hover:text-white transition"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  </nav>
{/if}
