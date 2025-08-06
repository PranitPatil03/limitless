import { getUserS3Client } from "@/lib/aws/s3";
import { NextRequest, NextResponse } from "next/server";
import * as AWS from "aws-sdk";

export async function DELETE(req: NextRequest) {
  try {
    const { userId, bucketName, fileKey } = await req.json();

    console.log("Delete file request:", { userId, bucketName, fileKey });

    if (!userId || !bucketName || !fileKey) {
      return NextResponse.json(
        { message: "Missing userId, bucketName, or fileKey" },
        { status: 400 }
      );
    }

    const s3 = await getUserS3Client(userId);

    // Check if file exists before trying to delete
    try {
      await s3.headObject({ Bucket: bucketName, Key: fileKey }).promise();
    } catch (error: unknown) {
      const awsError = error as AWS.AWSError;
      if (awsError.statusCode === 404) {
        return NextResponse.json(
          { message: "File not found" },
          { status: 404 }
        );
      }
      throw error;
    }

    // Delete the file
    await s3
      .deleteObject({
        Bucket: bucketName,
        Key: fileKey,
      })
      .promise();

    return NextResponse.json({
      message: "File deleted successfully",
      deletedKey: fileKey,
    });
  } catch (error) {
    console.error("Error deleting file:", error);
    const awsError = error as AWS.AWSError;

    if (awsError.statusCode === 403) {
      return NextResponse.json(
        { message: "Access denied. Check AWS role permissions." },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        message: "Failed to delete file",
        error: awsError.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
