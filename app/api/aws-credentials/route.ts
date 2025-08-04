import { NextRequest, NextResponse } from "next/server";
import { SecureAWSCredentialsService } from "@/lib/secure-aws-credentials";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { encryptedCredentials, expiration, userId } = body;

    console.log("encryptedCredentials",encryptedCredentials)
    console.log("userId",userId)
    console.log("expiration",expiration)


    if (!encryptedCredentials || !expiration || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await SecureAWSCredentialsService.storeEncryptedCredentials({
      encryptedCredentials,
      expiration: new Date(expiration),
      userId,
    });

    console.log("result",result)

    return NextResponse.json({
      success: true,
      id: result.id,
      message: "Credentials stored securely",
    });
  } catch (error) {
    console.error("Error storing AWS credentials:", error);
    return NextResponse.json(
      { error: "Failed to store credentials" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const id = searchParams.get("id");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    if (id) {
      const credential =
        await SecureAWSCredentialsService.getEncryptedCredentialsById(
          id,
          userId
        );
      if (!credential) {
        return NextResponse.json(
          { error: "Credential not found" },
          { status: 404 }
        );
      }

      console.log("credential",credential)

      return NextResponse.json(credential);
    } else {
      const credentials =
        await SecureAWSCredentialsService.getUserEncryptedCredentials(userId);

        console.log("credentials",credentials)

      return NextResponse.json(credentials);
    }
  } catch (error) {
    console.error("Error retrieving AWS credentials:", error);
    return NextResponse.json(
      { error: "Failed to retrieve credentials" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, encryptedCredentials, expiration, userId } = body;

    if (!id || !encryptedCredentials || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await SecureAWSCredentialsService.updateEncryptedCredentials(
      id,
      userId,
      encryptedCredentials,
      expiration ? new Date(expiration) : undefined
    );

    return NextResponse.json({
      success: true,
      message: "Credentials updated securely",
    });
  } catch (error) {
    console.error("Error updating AWS credentials:", error);
    return NextResponse.json(
      { error: "Failed to update credentials" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const userId = searchParams.get("userId");

    if (!id || !userId) {
      return NextResponse.json(
        { error: "ID and User ID are required" },
        { status: 400 }
      );
    }

    await SecureAWSCredentialsService.deleteCredentials(id, userId);

    return NextResponse.json({
      success: true,
      message: "Credentials deleted",
    });
  } catch (error) {
    console.error("Error deleting AWS credentials:", error);
    return NextResponse.json(
      { error: "Failed to delete credentials" },
      { status: 500 }
    );
  }
}
