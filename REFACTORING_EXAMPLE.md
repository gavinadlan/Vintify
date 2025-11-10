# Contoh Refactoring - Search Page

## Sebelum (Current Code)

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { auth } from '$lib/firebase/config';
  import { onAuthStateChanged } from 'firebase/auth';
  import { goto } from '$app/navigation';
  import { playSong } from '$lib/stores/player';
  import type { Song } from '$lib/types';
  import MusicPlayer from '$lib/components/MusicPlayer.svelte';
  import Navbar from '$lib/components/Navbar.svelte';

  let user: any = null;
  let allSongs: Song[] = [];
  let filteredSongs: Song[] = [];
  let searchQuery = '';
  let selectedGenre = '';
  let loading = true;

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

  $: {
    searchQuery;
    selectedGenre;
    handleSearch();
  }

  const genres = ['Pop', 'Rock', 'Hip Hop', 'Electronic', 'Jazz', 'Classical', 'R&B', 'Country', 'Indie', 'Other'];
</script>
```

## Sesudah (Refactored Code)

```svelte
<script lang="ts">
  import { playSong } from '$lib/stores/player';
  import type { Song } from '$lib/types';
  import MusicPlayer from '$lib/components/MusicPlayer.svelte';
  import Navbar from '$lib/components/Navbar.svelte';
  import { useAuthGuard } from '$lib/composables/use-auth-guard';
  import { songService } from '$lib/services/song-service';
  import { GENRES } from '$lib/utils/constants';
  import { getApiErrorMessage } from '$lib/utils/errors';

  let allSongs: Song[] = [];
  let filteredSongs: Song[] = [];
  let searchQuery = '';
  let selectedGenre = '';
  let error = '';

  // Use auth guard composable - no more duplication!
  const { user, loading } = useAuthGuard({
    onAuthChange: async () => {
      await loadAllSongs();
    }
  });

  async function loadAllSongs() {
    try {
      allSongs = await songService.getAllSongs();
      filteredSongs = allSongs;
      error = '';
    } catch (err) {
      error = getApiErrorMessage(err);
      console.error('Error loading songs:', err);
    }
  }

  function handleSearch() {
    filteredSongs = songService.searchSongs(allSongs, searchQuery, selectedGenre || undefined);
  }

  function handlePlay(song: Song) {
    playSong(song, filteredSongs);
  }

  $: {
    searchQuery;
    selectedGenre;
    handleSearch();
  }
</script>

<!-- Rest of template remains the same, but use GENRES constant -->
<select bind:value={selectedGenre}>
  <option value="">All Genres</option>
  {#each GENRES as genre}
    <option value={genre}>{genre}</option>
  {/each}
</select>
```

## Perbaikan yang Dilakukan

1. ✅ **Hilangkan duplikasi auth guard** - menggunakan `useAuthGuard` composable
2. ✅ **Gunakan service layer** - `songService.getAllSongs()` instead of direct fetch
3. ✅ **Centralized error handling** - `getApiErrorMessage()` untuk konsisten error messages
4. ✅ **Gunakan constants** - `GENRES` dari constants file
5. ✅ **Type safety** - tidak ada `any` type, proper typing untuk `user`
6. ✅ **Separation of concerns** - search logic dipindah ke service
7. ✅ **Cleaner code** - lebih readable dan maintainable

## Manfaat

- **Lebih mudah di-test** - service dan composable bisa di-test secara terpisah
- **Lebih mudah di-maintain** - perubahan logic hanya di satu tempat
- **Lebih konsisten** - error handling dan auth guard sama di semua page
- **Type safe** - TypeScript bisa catch errors lebih awal
- **Reusable** - service dan composable bisa dipakai di page lain

