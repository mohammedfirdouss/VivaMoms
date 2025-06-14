import { Platform } from 'react-native';

// Simple encryption utilities for demo purposes
// In a real app, use proper encryption libraries

export const encryptData = (data: string, key: string): string => {
  // Simple XOR encryption for demo
  let encrypted = '';
  for (let i = 0; i < data.length; i++) {
    encrypted += String.fromCharCode(
      data.charCodeAt(i) ^ key.charCodeAt(i % key.length)
    );
  }
  return btoa(encrypted);
};

export const decryptData = (encryptedData: string, key: string): string => {
  try {
    const encrypted = atob(encryptedData);
    let decrypted = '';
    for (let i = 0; i < encrypted.length; i++) {
      decrypted += String.fromCharCode(
        encrypted.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      );
    }
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    return '';
  }
};

export const generateEncryptionKey = (): string => {
  // Generate a random key for encryption
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let key = '';
  for (let i = 0; i < 32; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
};

export const hashPassword = (password: string): string => {
  // Simple hash function for demo purposes
  // In a real app, use bcrypt or similar
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(36);
};