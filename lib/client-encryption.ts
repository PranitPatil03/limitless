// Client-side encryption utilities
// This runs in the browser and encrypts credentials before sending to server

export interface EncryptedCredentials {
  encryptedAccessKeyId: string;
  encryptedSecretAccessKey: string;
  encryptedSessionToken?: string;
  salt: string;
  iv: string;
}

export async function encryptCredentialsClientSide(
  accessKeyId: string,
  secretAccessKey: string,
  sessionToken: string | undefined,
  userPassword: string
): Promise<EncryptedCredentials> {
  // Generate a salt and derive key from user's password
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await deriveKeyFromPassword(userPassword, salt);
  
  // Encrypt each credential separately
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  const encryptedAccessKeyId = await encryptWithKey(accessKeyId, key, iv);
  const encryptedSecretAccessKey = await encryptWithKey(secretAccessKey, key, iv);
  const encryptedSessionToken = sessionToken ? await encryptWithKey(sessionToken, key, iv) : undefined;
  
  return {
    encryptedAccessKeyId,
    encryptedSecretAccessKey,
    encryptedSessionToken,
    salt: arrayBufferToBase64(salt),
    iv: arrayBufferToBase64(iv)
  };
}

export async function decryptCredentialsClientSide(
  encryptedCredentials: EncryptedCredentials,
  userPassword: string
): Promise<{
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken?: string;
}> {
  const salt = base64ToArrayBuffer(encryptedCredentials.salt);
  const iv = base64ToArrayBuffer(encryptedCredentials.iv);
  const key = await deriveKeyFromPassword(userPassword, salt);
  
  const accessKeyId = await decryptWithKey(encryptedCredentials.encryptedAccessKeyId, key, iv);
  const secretAccessKey = await decryptWithKey(encryptedCredentials.encryptedSecretAccessKey, key, iv);
  const sessionToken = encryptedCredentials.encryptedSessionToken 
    ? await decryptWithKey(encryptedCredentials.encryptedSessionToken, key, iv)
    : undefined;
  
  return { accessKeyId, secretAccessKey, sessionToken };
}

async function deriveKeyFromPassword(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);
  
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );
  
  return await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

async function encryptWithKey(data: string, key: CryptoKey, iv: Uint8Array): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    dataBuffer
  );
  
  return arrayBufferToBase64(encrypted);
}

async function decryptWithKey(encryptedData: string, key: CryptoKey, iv: Uint8Array): Promise<string> {
  const encryptedBuffer = base64ToArrayBuffer(encryptedData);
  
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    encryptedBuffer
  );
  
  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
} 