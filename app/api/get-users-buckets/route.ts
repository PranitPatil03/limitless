import { NextRequest, NextResponse } from "next/server";
import { S3Client, ListBucketsCommand } from "@aws-sdk/client-s3";
import { SecureAWSCredentialsService } from "@/lib/secure-aws-credentials";
import { authClient } from "@/lib/auth-client";

export async function GET() {
  try {
    const session = await authClient.getSession();
    if (!session?.data?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.data.user.id;

    // Get user's encrypted credentials
    const encryptedCredentials =
      await SecureAWSCredentialsService.getValidEncryptedCredentials(userId);
    if (!encryptedCredentials) {
      return NextResponse.json(
        {
          error:
            "No valid AWS credentials found. Please add credentials in settings.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      encryptedCredentials: {
        id: encryptedCredentials.id,
        encryptedAccessKeyId: encryptedCredentials.encryptedAccessKeyId,
        encryptedSecretAccessKey: encryptedCredentials.encryptedSecretAccessKey,
        encryptedSessionToken: encryptedCredentials.encryptedSessionToken,
        salt: encryptedCredentials.salt,
        iv: encryptedCredentials.iv,
        expiration: encryptedCredentials.expiration,
      },
      message:
        "Please decrypt these credentials on the client side and use them to call AWS S3",
    });
  } catch (error) {
    console.error("Error getting AWS credentials:", error);
    return NextResponse.json(
      { error: "Failed to get AWS credentials" },
      { status: 500 }
    );
  }
}

// Alternative: If you want to handle decryption on server side (requires password)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { encryptionPassword } = body;

    if (!encryptionPassword) {
      return NextResponse.json(
        { error: "Encryption password is required" },
        { status: 400 }
      );
    }

    // Get user session
    const session = await authClient.getSession();
    if (!session?.data?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.data.user.id;

    // Get user's encrypted credentials
    const encryptedCredentials =
      await SecureAWSCredentialsService.getValidEncryptedCredentials(userId);
    if (!encryptedCredentials) {
      return NextResponse.json(
        {
          error:
            "No valid AWS credentials found. Please add credentials in settings.",
        },
        { status: 404 }
      );
    }

    // Import and use client-side decryption
    const { decryptCredentialsClientSide } = await import(
      "@/lib/client-encryption"
    );

    // Decrypt credentials
    const decryptedCredentials = await decryptCredentialsClientSide(
      {
        encryptedAccessKeyId: encryptedCredentials.encryptedAccessKeyId,
        encryptedSecretAccessKey: encryptedCredentials.encryptedSecretAccessKey,
        encryptedSessionToken: encryptedCredentials.encryptedSessionToken,
        salt: encryptedCredentials.salt,
        iv: encryptedCredentials.iv,
      },
      encryptionPassword
    );

    // Create S3 client with decrypted credentials
    const s3Client = new S3Client({
      region: "us-east-1",
      credentials: {
        accessKeyId: decryptedCredentials.accessKeyId,
        secretAccessKey: decryptedCredentials.secretAccessKey,
        sessionToken: decryptedCredentials.sessionToken,
      },
    });

    // List buckets
    const command = new ListBucketsCommand({});
    const response = await s3Client.send(command);

    return NextResponse.json({
      success: true,
      buckets: response.Buckets || [],
      owner: response.Owner,
    });
  } catch (error) {
    console.error("Error listing S3 buckets:", error);

    // Handle specific AWS errors
    if (error instanceof Error) {
      if (error.message.includes("InvalidAccessKeyId")) {
        return NextResponse.json(
          { error: "Invalid AWS Access Key ID" },
          { status: 400 }
        );
      }
      if (error.message.includes("SignatureDoesNotMatch")) {
        return NextResponse.json(
          { error: "Invalid AWS Secret Access Key" },
          { status: 400 }
        );
      }
      if (error.message.includes("AccessDenied")) {
        return NextResponse.json(
          { error: "Access denied. Check your AWS permissions." },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to list S3 buckets" },
      { status: 500 }
    );
  }
}
