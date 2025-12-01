<script lang="ts">
  import { auth } from '$lib/firebase/config';
  import { sendPasswordResetEmail } from 'firebase/auth';

  let email = '';
  let error = '';
  let success = false;
  let loading = false;

  async function handleReset() {
    error = '';
    success = false;
    
    if (!auth) {
      error = 'Firebase is not configured. Please set PUBLIC_FIREBASE_* envs and restart.';
      return;
    }
    
    if (!email) {
      error = 'Please enter your email address';
      return;
    }

    if (!email.includes('@')) {
      error = 'Please enter a valid email address';
      return;
    }

    loading = true;

    try {
      console.log('Sending password reset email to:', email);
      await sendPasswordResetEmail(auth as any, email);
      console.log('Password reset email sent successfully');
      success = true;
    } catch (err: any) {
      console.error('Password reset error:', err);
      if (err.code === 'auth/user-not-found') {
        error = 'No account found with this email';
      } else if (err.code === 'auth/invalid-email') {
        error = 'Invalid email address format';
      } else {
        error = `Failed to send reset email: ${err.message || 'Please try again.'}`;
      }
    } finally {
      loading = false;
    }
  }
</script>

<div class="min-h-screen bg-gray-900 flex items-center justify-center px-4">
  <div class="max-w-md w-full bg-gray-800 rounded-lg shadow-xl p-8">
    <h1 class="text-3xl font-bold text-white mb-2">Reset Password</h1>
    <p class="text-gray-400 mb-6">Enter your email to receive a reset link</p>

    {#if error}
      <div class="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded mb-4">
        {error}
      </div>
    {/if}

    {#if success}
      <div class="bg-green-500/10 border border-green-500 text-green-500 px-4 py-3 rounded mb-4">
        Password reset email sent! Check your inbox.
      </div>
    {/if}

    <form on:submit|preventDefault={handleReset} class="space-y-4">
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

      <button
        type="submit"
        disabled={loading}
        class="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 text-white font-semibold py-3 rounded-lg transition"
      >
        {loading ? 'Sending...' : 'Send Reset Link'}
      </button>
    </form>

    <p class="text-center text-gray-400 mt-6">
      Remember your password?
      <a href="/login" class="text-orange-500 hover:text-orange-400 font-medium">
        Login
      </a>
    </p>
  </div>
</div>
