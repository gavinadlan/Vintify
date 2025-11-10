// Validation utilities

import { ValidationError } from './errors';
import { AUDIO_FILE_TYPES, AUDIO_FILE_EXTENSIONS, MAX_FILE_SIZE } from './constants';

export function validateEmail(email: string): void {
  if (!email) {
    throw new ValidationError('Email harus diisi', 'email');
  }
  
  if (!email.includes('@')) {
    throw new ValidationError('Format email tidak valid', 'email');
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError('Format email tidak valid', 'email');
  }
}

export function validatePassword(password: string, minLength: number = 6): void {
  if (!password) {
    throw new ValidationError('Password harus diisi', 'password');
  }
  
  if (password.length < minLength) {
    throw new ValidationError(`Password minimal ${minLength} karakter`, 'password');
  }
}

export function validateRequired(value: string, fieldName: string): void {
  if (!value || value.trim() === '') {
    throw new ValidationError(`${fieldName} harus diisi`, fieldName);
  }
}

export function validateFileType(file: File, allowedTypes: readonly string[], allowedExtensions: readonly string[]): void {
  const isValidType = allowedTypes.includes(file.type);
  const isValidExtension = allowedExtensions.some(ext => 
    file.name.toLowerCase().endsWith(ext.toLowerCase())
  );
  
  if (!isValidType && !isValidExtension) {
    throw new ValidationError(
      `File harus berformat: ${allowedExtensions.join(', ')}`,
      'file'
    );
  }
}

export function validateFileSize(file: File, maxSize: number): void {
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / 1024 / 1024).toFixed(0);
    throw new ValidationError(
      `Ukuran file maksimal ${maxSizeMB}MB`,
      'file'
    );
  }
}

export function validateAudioFile(file: File): void {
  validateFileType(file, AUDIO_FILE_TYPES, AUDIO_FILE_EXTENSIONS);
  validateFileSize(file, MAX_FILE_SIZE);
}

export function validateImageFile(file: File): void {
  if (!file.type.startsWith('image/')) {
    throw new ValidationError('File harus berupa gambar', 'file');
  }
}

export function validateGenre(genre: string): void {
  // Genre validation bisa ditambahkan jika perlu
  if (genre && genre.trim() === '') {
    throw new ValidationError('Genre tidak valid', 'genre');
  }
}

