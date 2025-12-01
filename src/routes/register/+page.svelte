<script lang="ts">
  import { auth } from '$lib/firebase/config';
  import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
  import { goto } from '$app/navigation';

  let name = '';
  let email = '';
  let password = '';
  let confirmPassword = '';
  let error = '';
  let loading = false;

  async function handleRegister() {
    error = '';
    
    if (!auth) {
      error = 'Firebase is not configured. Please set PUBLIC_FIREBASE_* envs and restart.';
      console.error('Firebase auth not available');
      return;
    }
    
    if (!name || !email || !password || !confirmPassword) {
      error = 'Please fill in all fields';
      return;
    }

    if (!email.includes('@')) {
      error = 'Please enter a valid email address';
      return;
    }

    if (password.length < 6) {
      error = 'Password must be at least 6 characters';
      return;
    }

    if (password !== confirmPassword) {
      error = 'Passwords do not match';
      return;
    }

    loading = true;

    try {
      console.log('Creating user account...');
      const userCredential = await createUserWithEmailAndPassword(auth as any, email, password);
      console.log('User created, updating profile...');
      await updateProfile(userCredential.user, { displayName: name });
      console.log('Profile updated, redirecting to library...');
      goto('/library');
    } catch (err: any) {
      console.error('Registration error:', err);
      console.error('Error code:', err.code);
      console.error('Error message:', err.message);
      
      if (err.code === 'auth/email-already-in-use') {
        error = 'An account with this email already exists. Try logging in instead.';
      } else if (err.code === 'auth/weak-password') {
        error = 'Password is too weak. Please use a stronger password (at least 6 characters).';
      } else if (err.code === 'auth/invalid-email') {
        error = 'Invalid email address format. Please check your email.';
      } else if (err.code === 'auth/operation-not-allowed') {
        error = 'Email/password accounts are not enabled. Please contact support.';
      } else if (err.code === 'auth/network-request-failed') {
        error = 'Network error. Please check your internet connection and try again.';
      } else {
        error = `Failed to create account: ${err.message || 'Please try again.'}`;
      }
    } finally {
      loading = false;
    }
  }
</script>

<div class="min-h-screen bg-gray-900 flex items-center justify-center px-4">
  <div class="max-w-md w-full bg-gray-800 rounded-lg shadow-xl p-8">
    <h1 class="text-3xl font-bold text-white mb-2">Join Vintify</h1>
    <p class="text-gray-400 mb-6">Create your account and start streaming</p>

    {#if error}
      <div class="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded mb-4">
        <p class="font-medium">{error}</p>
        {#if error.includes('already exists')}
          <p class="text-sm text-red-400 mt-2">
            Already have an account? <a href="/login" class="underline font-medium">Login here</a>
          </p>
        {/if}
      </div>
    {/if}

    <form on:submit|preventDefault={handleRegister} class="space-y-4">
      <div>
        <label for="name" class="block text-sm font-medium text-gray-300 mb-2">
          Full Name
        </label>
        <input
          type="text"
          id="name"
          bind:value={name}
          class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
          placeholder="John Doe"
          required
        />
      </div>

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

      <div>
        <label for="confirmPassword" class="block text-sm font-medium text-gray-300 mb-2">
          Confirm Password
        </label>
        <input
          type="password"
          id="confirmPassword"
          bind:value={confirmPassword}
          class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
          placeholder="••••••••"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        class="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 text-white font-semibold py-3 rounded-lg transition"
      >
        {loading ? 'Creating account...' : 'Create Account'}
      </button>
    </form>

    <p class="text-center text-gray-400 mt-6">
      Already have an account?
      <a href="/login" class="text-orange-500 hover:text-orange-400 font-medium">
        Login
      </a>
    </p>
  </div>
</div>
