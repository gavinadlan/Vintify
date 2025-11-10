// Centralized error handling utilities

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public field?: string) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}

export class AuthError extends AppError {
  constructor(message: string) {
    super(message, 'AUTH_ERROR', 401);
    this.name = 'AuthError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

export class ServerError extends AppError {
  constructor(message: string = 'Internal server error') {
    super(message, 'SERVER_ERROR', 500);
    this.name = 'ServerError';
  }
}

// Error message mapper untuk Firebase Auth errors
export function getFirebaseAuthErrorMessage(error: any): string {
  const code = error?.code || '';
  
  const errorMap: Record<string, string> = {
    'auth/user-not-found': 'Tidak ada akun dengan email ini',
    'auth/wrong-password': 'Password salah',
    'auth/invalid-credential': 'Email atau password tidak valid',
    'auth/email-already-in-use': 'Email sudah terdaftar',
    'auth/weak-password': 'Password terlalu lemah',
    'auth/invalid-email': 'Email tidak valid',
    'auth/too-many-requests': 'Terlalu banyak percobaan. Silakan coba lagi nanti.',
    'auth/network-request-failed': 'Koneksi gagal. Periksa koneksi internet Anda.',
  };

  return errorMap[code] || 'Terjadi kesalahan. Silakan coba lagi.';
}

// Error message mapper untuk API errors
export function getApiErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'Terjadi kesalahan yang tidak diketahui';
}

// Extract error details dari API response
export async function extractApiError(response: Response): Promise<string> {
  try {
    const data = await response.json();
    return data?.error || data?.details || `HTTP ${response.status}: ${response.statusText}`;
  } catch {
    return `HTTP ${response.status}: ${response.statusText}`;
  }
}

