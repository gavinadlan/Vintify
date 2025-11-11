import type { RequestHandler } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';

// OAuth callback handler untuk Spotify
// Untuk sekarang, kita pakai Client Credentials Flow jadi endpoint ini tidak terlalu diperlukan
// Tapi kita buat untuk future use jika mau pakai Authorization Code Flow

export const GET: RequestHandler = async ({ url }) => {
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  if (error) {
    // Redirect ke halaman error atau search dengan error message
    throw redirect(302, '/search?error=' + encodeURIComponent(error));
  }

  if (code) {
    // Jika ada code, bisa process OAuth flow di sini
    // Untuk sekarang, redirect ke search
    throw redirect(302, '/search');
  }

  // Default redirect ke search
  throw redirect(302, '/search');
};

