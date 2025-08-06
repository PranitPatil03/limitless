import { getUserS3Client } from "@/lib/aws/s3";
import { NextRequest, NextResponse } from "next/server";
import * as AWS from "aws-sdk";

export async function DELETE(req: NextRequest) {
  try {
    const { userId, bucketName, folderPath } = await req.json();

    if (!userId || !bucketName || !folderPath) {
      return NextResponse.json(
        { message: "Missing userId, bucketName, or folderPath" },
        { status: 400 }
      );
    }

    const s3 = await getUserS3Client(userId);

    // Ensure folder path ends with '/'
    const normalizedFolderPath = folderPath.endsWith("/")
      ? folderPath
      : folderPath + "/";

    let isTruncated = true;
    let continuationToken: string | undefined = undefined;
    let totalDeleted = 0;
    const deletedObjects: string[] = [];

    while (isTruncated) {
      // List all objects with the folder prefix
      const listResult = await s3
        .listObjectsV2({
          Bucket: bucketName,
          Prefix: normalizedFolderPath,
          ContinuationToken: continuationToken,
          MaxKeys: 1000,
        })
        .promise();

      const objects = listResult.Contents || [];

      if (objects.length > 0) {
        // Delete objects in batch
        const deleteParams = {
          Bucket: bucketName,
          Delete: {
            Objects: objects.map((obj) => ({ Key: obj.Key! })),
            Quiet: false, // Set to false to get details of deleted objects
          },
        };

        const deleteResult = await s3.deleteObjects(deleteParams).promise();
        totalDeleted += objects.length;

        // Track deleted objects
        if (deleteResult.Deleted) {
          deletedObjects.push(...deleteResult.Deleted.map((d) => d.Key!));
        }

        // Check for errors in batch delete
        if (deleteResult.Errors && deleteResult.Errors.length > 0) {
          console.error("Errors during batch delete:", deleteResult.Errors);
          return NextResponse.json(
            {
              message: "Some objects could not be deleted",
              errors: deleteResult.Errors,
              partiallyDeleted: totalDeleted,
              deletedObjects: deletedObjects,
            },
            { status: 500 }
          );
        }
      }

      isTruncated = listResult.IsTruncated || false;
      continuationToken = listResult.NextContinuationToken;
    }

    if (totalDeleted === 0) {
      return NextResponse.json(
        {
          message: "Folder not found or already empty",
          folderPath: normalizedFolderPath,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: `Folder deleted successfully`,
      deletedFolder: normalizedFolderPath,
      objectsDeleted: totalDeleted,
      deletedObjects: deletedObjects,
    });
  } catch (error) {
    console.error("Error deleting folder:", error);
    const awsError = error as AWS.AWSError;

    if (awsError.statusCode === 403) {
      return NextResponse.json(
        { message: "Access denied. Check AWS role permissions." },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        message: "Failed to delete folder",
        error: awsError.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
