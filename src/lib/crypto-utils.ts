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
 * UTF-8 safe base64 encoding
 * Handles Unicode characters properly
 */
const utf8ToBase64 = (str: string): string => {
  try {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode(parseInt(p1, 16))));
  } catch (error) {
    console.error('[Crypto] UTF-8 to base64 failed:', error);
    return '';
  }
};

/**
 * UTF-8 safe base64 decoding
 * Handles Unicode characters properly
 */
const base64ToUtf8 = (str: string): string => {
  try {
    return decodeURIComponent(atob(str).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
  } catch (error) {
    console.error('[Crypto] Base64 to UTF-8 failed:', error);
    return '';
  }
};

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
  
  return utf8ToBase64(result); // UTF-8 safe base64 encode
};

/**
 * Decrypts a string using XOR cipher
 * @param encrypted - Encrypted string (base64 encoded)
 * @returns Decrypted plain text
 */
export const decrypt = (encrypted: string): string => {
  if (!encrypted) return '';
  
  try {
    const decoded = base64ToUtf8(encrypted); // UTF-8 safe base64 decode
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

/**
 * Clears corrupted builder templates from localStorage
 * Call this if you see decryption errors
 */
export const clearCorruptedTemplates = (): void => {
  try {
    localStorage.removeItem('builder_templates');
    console.log('[SecureStorage] Cleared corrupted builder_templates');
  } catch (error) {
    console.error('[SecureStorage] Error clearing templates:', error);
  }
};
