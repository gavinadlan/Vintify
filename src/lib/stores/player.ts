import { writable } from 'svelte/store';
import type { Song, PlayerState } from '$lib/types';

const initialState: PlayerState = {
  currentSong: null,
  isPlaying: false,
  volume: 0.7,
  progress: 0,
  duration: 0,
  queue: [],
  currentIndex: -1,
  shuffle: false,
  repeat: false
};

export const playerStore = writable<PlayerState>(initialState);

export function playSong(song: Song, queue: Song[] = []) {
  playerStore.update(state => ({
    ...state,
    currentSong: song,
    isPlaying: true,
    queue: queue.length > 0 ? queue : [song],
    currentIndex: queue.length > 0 ? queue.findIndex(s => s.id === song.id) : 0
  }));
}

export function togglePlay() {
  playerStore.update(state => ({
    ...state,
    isPlaying: !state.isPlaying
  }));
}

export function setVolume(volume: number) {
  playerStore.update(state => ({
    ...state,
    volume
  }));
}

export function setProgress(progress: number) {
  playerStore.update(state => ({
    ...state,
    progress
  }));
}

export function setDuration(duration: number) {
  playerStore.update(state => ({
    ...state,
    duration
  }));
}

export function nextSong() {
  playerStore.update(state => {
    if (state.queue.length === 0) return state;
    
    let nextIndex = state.currentIndex + 1;
    
    if (nextIndex >= state.queue.length) {
      if (state.repeat) {
        nextIndex = 0;
      } else {
        return { ...state, isPlaying: false };
      }
    }
    
    return {
      ...state,
      currentIndex: nextIndex,
      currentSong: state.queue[nextIndex],
      progress: 0
    };
  });
}

export function previousSong() {
  playerStore.update(state => {
    if (state.queue.length === 0) return state;
    
    let prevIndex = state.currentIndex - 1;
    
    if (prevIndex < 0) {
      prevIndex = state.queue.length - 1;
    }
    
    return {
      ...state,
      currentIndex: prevIndex,
      currentSong: state.queue[prevIndex],
      progress: 0
    };
  });
}

export function toggleShuffle() {
  playerStore.update(state => ({
    ...state,
    shuffle: !state.shuffle
  }));
}

export function toggleRepeat() {
  playerStore.update(state => ({
    ...state,
    repeat: !state.repeat
  }));
}
