/**
 * Cryptographic Utilities for Secure Storage
 * Provides encryption/decryption for sensitive data in localStorage
 */

/**
 * Simple XOR-based encryption for localStorage (obfuscation)
 * Note: For production, consider using Web Crypto API with proper key management
 */
const ENCRYPTION_KEY = 'PROQUELEC_BUILDER_ENCRYPTION_KEY_V1';

/**
 * Encrypts a string using XOR cipher
 * @param text - Plain text to encrypt
 * @returns Encrypted string (base64 encoded)
 */
export const encrypt = (text: string): string => {
  if (!text) return '';
  
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(
      text.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length)
    );
  }
  
  return btoa(result); // Base64 encode
};

/**
 * Decrypts a string using XOR cipher
 * @param encrypted - Encrypted string (base64 encoded)
 * @returns Decrypted plain text
 */
export const decrypt = (encrypted: string): string => {
  if (!encrypted) return '';
  
  try {
    const decoded = atob(encrypted); // Base64 decode
    let result = '';
    
    for (let i = 0; i < decoded.length; i++) {
      result += String.fromCharCode(
        decoded.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length)
      );
    }
    
    return result;
  } catch (error) {
    console.error('[Crypto] Decryption failed:', error);
    return '';
  }
};

/**
 * Encrypts an object before storing in localStorage
 * @param key - Storage key
 * @param value - Object to store
 */
export const secureSetItem = (key: string, value: unknown): boolean => {
  try {
    const serialized = JSON.stringify(value);
    const encrypted = encrypt(serialized);
    localStorage.setItem(key, encrypted);
    return true;
  } catch (error) {
    console.error(`[SecureStorage] Error encrypting ${key}:`, error);
    return false;
  }
};

/**
 * Decrypts an object from localStorage
 * @param key - Storage key
 * @param defaultValue - Default value if key doesn't exist or decryption fails
 * @returns Decrypted object or default value
 */
export const secureGetItem = <T,>(key: string, defaultValue: T): T => {
  try {
    const encrypted = localStorage.getItem(key);
    if (!encrypted) return defaultValue;
    
    const decrypted = decrypt(encrypted);
    return JSON.parse(decrypted) as T;
  } catch (error) {
    console.error(`[SecureStorage] Error decrypting ${key}:`, error);
    return defaultValue;
  }
};

/**
 * Removes an item from localStorage
 * @param key - Storage key
 */
export const secureRemoveItem = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`[SecureStorage] Error removing ${key}:`, error);
  }
};
