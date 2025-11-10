// Composable untuk auth guard - menghilangkan duplikasi
// Simplified version menggunakan writable stores

import { writable } from 'svelte/store';
import { onMount } from 'svelte';
import { goto } from '$app/navigation';
import { auth } from '$lib/firebase/config';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { ROUTES } from '$lib/utils/constants';
import { browser } from '$app/environment';

export interface UseAuthGuardOptions {
  redirectTo?: string;
  requireAuth?: boolean;
  onAuthChange?: (user: User | null) => void | Promise<void>;
}

export interface UseAuthGuardReturn {
  user: ReturnType<typeof writable<User | null>>;
  loading: ReturnType<typeof writable<boolean>>;
  isAuthenticated: ReturnType<typeof writable<boolean>>;
}

/**
 * Composable untuk handle authentication guard
 * Mengembalikan reactive stores untuk user, loading, dan isAuthenticated
 * 
 * @example
 * ```svelte
 * <script>
 *   import { useAuthGuard } from '$lib/composables/use-auth-guard';
 *   import { songService } from '$lib/services/song-service';
 *   
 *   const { user, loading } = useAuthGuard({
 *     onAuthChange: async (user) => {
 *       if (user) {
 *         await loadSongs();
 *       }
 *     }
 *   });
 * </script>
 * 
 * {#if $loading}
 *   Loading...
 * {:else if $user}
 *   Welcome {$user.email}
 * {/if}
 * ```
 */
export function useAuthGuard(options?: UseAuthGuardOptions): UseAuthGuardReturn {
  const {
    redirectTo = ROUTES.LOGIN,
    requireAuth = true,
    onAuthChange
  } = options || {};

  const user = writable<User | null>(null);
  const loading = writable<boolean>(true);
  const isAuthenticated = writable<boolean>(false);

  onMount(() => {
    if (!browser || !auth) {
      if (requireAuth) {
        goto(redirectTo);
      }
      loading.set(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      user.set(currentUser);
      isAuthenticated.set(!!currentUser);
      
      if (requireAuth && !currentUser) {
        goto(redirectTo);
        return;
      }

      if (onAuthChange) {
        await onAuthChange(currentUser);
      }

      loading.set(false);
    });

    return unsubscribe;
  });

  return {
    user,
    loading,
    isAuthenticated
  };
}

