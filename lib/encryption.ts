import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-fallback-encryption-key-32-chars-long';
const ALGORITHM = 'aes-256-gcm';

export interface EncryptedData {
  encrypted: string;
  iv: string;
  authTag: string;
}

export function encrypt(text: string): EncryptedData {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher(ALGORITHM, ENCRYPTION_KEY);
  cipher.setAAD(Buffer.from('aws-credentials', 'utf8'));
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag: cipher.getAuthTag().toString('hex')
  };
}

export function decrypt(encryptedData: EncryptedData): string {
  const decipher = crypto.createDecipher(ALGORITHM, ENCRYPTION_KEY);
  decipher.setAAD(Buffer.from('aws-credentials', 'utf8'));
  decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
  
  let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

export function encryptCredentials(accessKeyId: string, secretAccessKey: string, sessionToken?: string) {
  const encryptedAccessKey = encrypt(accessKeyId);
  const encryptedSecretKey = encrypt(secretAccessKey);
  const encryptedSessionToken = sessionToken ? encrypt(sessionToken) : null;
  
  return {
    encryptedAccessKeyId: JSON.stringify(encryptedAccessKey),
    encryptedSecretAccessKey: JSON.stringify(encryptedSecretKey),
    encryptedSessionToken: encryptedSessionToken ? JSON.stringify(encryptedSessionToken) : null
  };
}

export function decryptCredentials(
  encryptedAccessKeyId: string,
  encryptedSecretAccessKey: string,
  encryptedSessionToken?: string | null
) {
  const accessKeyId = decrypt(JSON.parse(encryptedAccessKeyId));
  const secretAccessKey = decrypt(JSON.parse(encryptedSecretAccessKey));
  const sessionToken = encryptedSessionToken ? decrypt(JSON.parse(encryptedSessionToken)) : undefined;
  
  return {
    accessKeyId,
    secretAccessKey,
    sessionToken
  };
} 