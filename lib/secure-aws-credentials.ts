import { prisma } from './prisma';
import type { EncryptedCredentials } from './client-encryption';

export interface EncryptedAWSCredentialsInput {
  encryptedCredentials: EncryptedCredentials;
  expiration: Date;
  userId: string;
}

export interface StoredAWSCredentials {
  id: string;
  encryptedAccessKeyId: string;
  encryptedSecretAccessKey: string;
  encryptedSessionToken?: string;
  salt: string;
  iv: string;
  expiration: Date;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export class SecureAWSCredentialsService {
  // This service can only store and retrieve encrypted data
  // It cannot decrypt the credentials - only the client can do that
  
  static async storeEncryptedCredentials(input: EncryptedAWSCredentialsInput) {
    return await prisma.aWSCredentials.create({
      data: {
        id: crypto.randomUUID(),
        encryptedAccessKeyId: input.encryptedCredentials.encryptedAccessKeyId,
        encryptedSecretAccessKey: input.encryptedCredentials.encryptedSecretAccessKey,
        encryptedSessionToken: input.encryptedCredentials.encryptedSessionToken,
        salt: input.encryptedCredentials.salt,
        iv: input.encryptedCredentials.iv,
        expiration: input.expiration,
        userId: input.userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  static async getEncryptedCredentialsById(id: string, userId: string): Promise<StoredAWSCredentials | null> {
    const credentials = await prisma.aWSCredentials.findFirst({
      where: {
        id,
        userId, // Ensure user can only access their own credentials
      },
    });

    if (!credentials) {
      return null;
    }

    return {
      id: credentials.id,
      encryptedAccessKeyId: credentials.encryptedAccessKeyId,
      encryptedSecretAccessKey: credentials.encryptedSecretAccessKey,
      encryptedSessionToken: credentials.encryptedSessionToken,
      salt: credentials.salt,
      iv: credentials.iv,
      expiration: credentials.expiration,
      createdAt: credentials.createdAt,
      updatedAt: credentials.updatedAt,
      userId: credentials.userId,
    };
  }

  static async getUserEncryptedCredentials(userId: string): Promise<StoredAWSCredentials[]> {
    const credentials = await prisma.aWSCredentials.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return credentials.map(cred => ({
      id: cred.id,
      encryptedAccessKeyId: cred.encryptedAccessKeyId,
      encryptedSecretAccessKey: cred.encryptedSecretAccessKey,
      encryptedSessionToken: cred.encryptedSessionToken,
      salt: cred.salt,
      iv: cred.iv,
      expiration: cred.expiration,
      createdAt: cred.createdAt,
      updatedAt: cred.updatedAt,
      userId: cred.userId,
    }));
  }

  static async updateEncryptedCredentials(
    id: string,
    userId: string,
    encryptedCredentials: EncryptedCredentials,
    expiration?: Date
  ) {
    // First verify the user owns this credential
    const existing = await prisma.aWSCredentials.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new Error('Credentials not found or access denied');
    }

    const updateData: any = {
      encryptedAccessKeyId: encryptedCredentials.encryptedAccessKeyId,
      encryptedSecretAccessKey: encryptedCredentials.encryptedSecretAccessKey,
      encryptedSessionToken: encryptedCredentials.encryptedSessionToken,
      salt: encryptedCredentials.salt,
      iv: encryptedCredentials.iv,
      updatedAt: new Date(),
    };

    if (expiration) {
      updateData.expiration = expiration;
    }

    return await prisma.aWSCredentials.update({
      where: { id },
      data: updateData,
    });
  }

  static async deleteCredentials(id: string, userId: string) {
    // Ensure user can only delete their own credentials
    return await prisma.aWSCredentials.deleteMany({
      where: {
        id,
        userId,
      },
    });
  }

  static async getValidEncryptedCredentials(userId: string): Promise<StoredAWSCredentials | null> {
    const now = new Date();
    
    const credentials = await prisma.aWSCredentials.findFirst({
      where: {
        userId,
        expiration: {
          gt: now,
        },
      },
      orderBy: {
        expiration: 'desc',
      },
    });

    if (!credentials) {
      return null;
    }

    return {
      id: credentials.id,
      encryptedAccessKeyId: credentials.encryptedAccessKeyId,
      encryptedSecretAccessKey: credentials.encryptedSecretAccessKey,
      encryptedSessionToken: credentials.encryptedSessionToken,
      salt: credentials.salt,
      iv: credentials.iv,
      expiration: credentials.expiration,
      createdAt: credentials.createdAt,
      updatedAt: credentials.updatedAt,
      userId: credentials.userId,
    };
  }
} 