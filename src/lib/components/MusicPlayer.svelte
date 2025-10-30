<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Howl } from 'howler';
  import { playerStore, togglePlay, setVolume, setProgress, setDuration, nextSong, previousSong, toggleShuffle, toggleRepeat } from '$lib/stores/player';

  let howl: Howl | null = null;
  let progressInterval: number;
  let isDragging = false;

  $: if ($playerStore.currentSong && howl?.state() === 'unloaded') {
    loadSong($playerStore.currentSong.audioUrl);
  }

  $: if ($playerStore.currentSong && (!howl || howl._src !== $playerStore.currentSong.audioUrl)) {
    loadSong($playerStore.currentSong.audioUrl);
  }

  $: if (howl) {
    howl.volume($playerStore.volume);
  }

  $: if (howl && $playerStore.isPlaying) {
    howl.play();
    startProgressTracking();
  } else if (howl && !$playerStore.isPlaying) {
    howl.pause();
    stopProgressTracking();
  }

  function loadSong(url: string) {
    if (howl) {
      howl.unload();
    }

    howl = new Howl({
      src: [url],
      html5: true,
      onload: function() {
        setDuration(howl!.duration());
      },
      onend: function() {
        handleSongEnd();
      },
      onloaderror: function(id, error) {
        console.error('Error loading audio:', error);
      },
      onplayerror: function(id, error) {
        console.error('Error playing audio:', error);
      }
    });

    howl.volume($playerStore.volume);
  }

  function handleSongEnd() {
    if ($playerStore.repeat) {
      howl?.seek(0);
      howl?.play();
    } else {
      nextSong();
    }
  }

  function startProgressTracking() {
    stopProgressTracking();
    progressInterval = window.setInterval(() => {
      if (howl && !isDragging) {
        const seek = howl.seek();
        setProgress(typeof seek === 'number' ? seek : 0);
      }
    }, 100);
  }

  function stopProgressTracking() {
    if (progressInterval) {
      clearInterval(progressInterval);
    }
  }

  function handleProgressChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const newProgress = parseFloat(target.value);
    setProgress(newProgress);
    if (howl) {
      howl.seek(newProgress);
    }
  }

  function handleVolumeChange(event: Event) {
    const target = event.target as HTMLInputElement;
    setVolume(parseFloat(target.value));
  }

  function formatTime(seconds: number): string {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  onDestroy(() => {
    stopProgressTracking();
    if (howl) {
      howl.unload();
    }
  });
</script>

{#if $playerStore.currentSong}
  <div class="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 px-4 py-3 z-50">
    <div class="max-w-7xl mx-auto">
      <div class="flex items-center gap-4">
        <!-- Song Info -->
        <div class="flex items-center gap-3 flex-1 min-w-0">
          <div class="w-14 h-14 bg-gray-700 rounded flex-shrink-0 overflow-hidden">
            {#if $playerStore.currentSong.albumArt}
              <img src={$playerStore.currentSong.albumArt} alt="Album art" class="w-full h-full object-cover" />
            {:else}
              <div class="w-full h-full flex items-center justify-center text-gray-500">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
            {/if}
          </div>
          <div class="min-w-0">
            <div class="text-white font-medium truncate">{$playerStore.currentSong.title}</div>
            <div class="text-gray-400 text-sm truncate">{$playerStore.currentSong.artist}</div>
          </div>
        </div>

        <!-- Player Controls -->
        <div class="flex flex-col items-center gap-2 flex-1">
          <div class="flex items-center gap-4">
            <button
              on:click={toggleShuffle}
              class="text-gray-400 hover:text-white transition p-1"
              class:text-orange-500={$playerStore.shuffle}
              title="Shuffle"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </button>

            <button on:click={previousSong} class="text-gray-400 hover:text-white transition p-1" title="Previous">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
              </svg>
            </button>

            <button
              on:click={togglePlay}
              class="bg-orange-500 hover:bg-orange-600 text-white rounded-full p-2 transition"
              title={$playerStore.isPlaying ? 'Pause' : 'Play'}
            >
              {#if $playerStore.isPlaying}
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                </svg>
              {:else}
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              {/if}
            </button>

            <button on:click={nextSong} class="text-gray-400 hover:text-white transition p-1" title="Next">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
              </svg>
            </button>

            <button
              on:click={toggleRepeat}
              class="text-gray-400 hover:text-white transition p-1"
              class:text-orange-500={$playerStore.repeat}
              title="Repeat"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          <!-- Progress Bar -->
          <div class="w-full max-w-2xl flex items-center gap-2">
            <span class="text-xs text-gray-400 w-10 text-right">{formatTime($playerStore.progress)}</span>
            <input
              type="range"
              min="0"
              max={$playerStore.duration || 100}
              step="0.1"
              value={$playerStore.progress}
              on:input={handleProgressChange}
              on:mousedown={() => isDragging = true}
              on:mouseup={() => isDragging = false}
              class="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer range-slider"
            />
            <span class="text-xs text-gray-400 w-10">{formatTime($playerStore.duration)}</span>
          </div>
        </div>

        <!-- Volume Control -->
        <div class="flex items-center gap-2 flex-1 justify-end">
          <svg class="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
          </svg>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={$playerStore.volume}
            on:input={handleVolumeChange}
            class="w-24 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer range-slider"
          />
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .range-slider::-webkit-slider-thumb {
    appearance: none;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #FF6B35;
    cursor: pointer;
  }

  .range-slider::-moz-range-thumb {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #FF6B35;
    cursor: pointer;
    border: none;
  }

  .range-slider::-webkit-slider-runnable-track {
    background: linear-gradient(to right, #FF6B35 0%, #FF6B35 var(--progress, 0%), #374151 var(--progress, 0%), #374151 100%);
  }
</style>
