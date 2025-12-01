<script lang="ts">
  import { auth } from '$lib/firebase/config';
  import { signInWithEmailAndPassword } from 'firebase/auth';
  import { goto } from '$app/navigation';

  let email = '';
  let password = '';
  let error = '';
  let loading = false;

  async function handleLogin() {
    error = '';
    
    if (!auth) {
      error = 'Firebase is not configured. Please set PUBLIC_FIREBASE_* envs and restart.';
      console.error('Firebase auth not available');
      return;
    }
    
    if (!email || !password) {
      error = 'Please fill in all fields';
      return;
    }

    if (!email.includes('@')) {
      error = 'Please enter a valid email address';
      return;
    }

    loading = true;

    try {
      console.log('Attempting to login with email:', email);
      await signInWithEmailAndPassword(auth as any, email, password);
      console.log('Login successful, redirecting...');
      goto('/library');
    } catch (err: any) {
      console.error('Login error:', err);
      console.error('Error code:', err.code);
      console.error('Error message:', err.message);
      
      if (err.code === 'auth/user-not-found') {
        error = 'No account found with this email. Please register first.';
      } else if (err.code === 'auth/wrong-password') {
        error = 'Incorrect password. Please try again.';
      } else if (err.code === 'auth/invalid-credential') {
        error = 'Invalid email or password. Make sure you have registered an account first.';
      } else if (err.code === 'auth/invalid-email') {
        error = 'Invalid email address format.';
      } else if (err.code === 'auth/too-many-requests') {
        error = 'Too many failed login attempts. Please try again later.';
      } else if (err.code === 'auth/operation-not-allowed') {
        error = 'Email/password login is not enabled. Please contact support.';
      } else if (err.code === 'auth/network-request-failed') {
        error = 'Network error. Please check your internet connection.';
      } else {
        error = `Failed to login: ${err.message || 'Please try again.'}`;
      }
    } finally {
      loading = false;
    }
  }
</script>

<div class="min-h-screen bg-gray-900 flex items-center justify-center px-4">
  <div class="max-w-md w-full bg-gray-800 rounded-lg shadow-xl p-8">
    <h1 class="text-3xl font-bold text-white mb-2">Login to Vintify</h1>
    <p class="text-gray-400 mb-6">Welcome back to your music</p>

    {#if error}
      <div class="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded mb-4">
        <p class="font-medium">{error}</p>
        {#if error.includes('Invalid email or password') || error.includes('Incorrect password')}
          <div class="text-sm text-red-400 mt-2 space-y-1">
            <p>• Make sure you're using the correct password</p>
            <p>• <a href="/forgot-password" class="underline font-medium">Forgot password?</a> Reset it here</p>
            <p>• Don't have an account? <a href="/register" class="underline font-medium">Register here</a></p>
          </div>
        {:else if error.includes('No account found')}
          <p class="text-sm text-red-400 mt-2">
            Don't have an account? <a href="/register" class="underline font-medium">Register here</a>
          </p>
        {/if}
      </div>
    {/if}

    <form on:submit|preventDefault={handleLogin} class="space-y-4">
      <div>
        <label for="email" class="block text-sm font-medium text-gray-300 mb-2">
          Email Address
        </label>
        <input
          type="email"
          id="email"
          bind:value={email}
          class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
          placeholder="you@example.com"
          required
        />
      </div>

      <div>
        <label for="password" class="block text-sm font-medium text-gray-300 mb-2">
          Password
        </label>
        <input
          type="password"
          id="password"
          bind:value={password}
          class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
          placeholder="••••••••"
          required
        />
      </div>

      <div class="flex items-center justify-between text-sm">
        <a href="/forgot-password" class="text-orange-500 hover:text-orange-400">
          Forgot password?
        </a>
      </div>

      <button
        type="submit"
        disabled={loading}
        class="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 text-white font-semibold py-3 rounded-lg transition"
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>

    <p class="text-center text-gray-400 mt-6">
      Don't have an account?
      <a href="/register" class="text-orange-500 hover:text-orange-400 font-medium">
        Register
      </a>
    </p>
  </div>
</div>
