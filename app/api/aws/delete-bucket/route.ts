import { getUserS3Client } from "@/lib/aws/s3";
import { NextRequest, NextResponse } from "next/server";
import * as AWS from "aws-sdk";

export async function DELETE(req: NextRequest) {
  try {
    const { userId, bucketName, force = false } = await req.json();

    if (!userId || !bucketName) {
      return NextResponse.json(
        { message: "Missing userId or bucketName" },
        { status: 400 }
      );
    }

    const s3 = await getUserS3Client(userId);

    // Check if bucket exists
    try {
      await s3.headBucket({ Bucket: bucketName }).promise();
    } catch (error: unknown) {
      const awsError = error as AWS.AWSError;
      if (awsError.statusCode === 404) {
        return NextResponse.json(
          { message: "Bucket not found" },
          { status: 404 }
        );
      }
      throw error;
    }

    // If force delete is requested, delete all objects first
    if (force) {
      let isTruncated = true;
      let continuationToken: string | undefined = undefined;
      let totalDeleted = 0;

      while (isTruncated) {
        // List objects in the bucket
        const listResult = await s3
          .listObjectsV2({
            Bucket: bucketName,
            ContinuationToken: continuationToken,
            MaxKeys: 1000, // Delete in batches
          })
          .promise();

        const objects = listResult.Contents || [];

        if (objects.length > 0) {
          // Delete objects in batch
          const deleteParams = {
            Bucket: bucketName,
            Delete: {
              Objects: objects.map((obj) => ({ Key: obj.Key! })),
              Quiet: true,
            },
          };

          const deleteResult = await s3.deleteObjects(deleteParams).promise();
          totalDeleted += objects.length;

          // Check for errors in batch delete
          if (deleteResult.Errors && deleteResult.Errors.length > 0) {
            console.error("Errors during batch delete:", deleteResult.Errors);
            return NextResponse.json(
              {
                message: "Some objects could not be deleted",
                errors: deleteResult.Errors,
                partiallyDeleted: totalDeleted,
              },
              { status: 500 }
            );
          }
        }

        isTruncated = listResult.IsTruncated || false;
        continuationToken = listResult.NextContinuationToken;
      }

      // Also delete any incomplete multipart uploads
      try {
        const multipartUploads = await s3
          .listMultipartUploads({
            Bucket: bucketName,
          })
          .promise();

        if (multipartUploads.Uploads && multipartUploads.Uploads.length > 0) {
          for (const upload of multipartUploads.Uploads) {
            if (upload.Key && upload.UploadId) {
              await s3
                .abortMultipartUpload({
                  Bucket: bucketName,
                  Key: upload.Key,
                  UploadId: upload.UploadId,
                })
                .promise();
            }
          }
        }
      } catch (multipartError) {
        console.warn("Error cleaning up multipart uploads:", multipartError);
        // Continue with bucket deletion even if multipart cleanup fails
      }
    } else {
      // Check if bucket is empty before deleting
      const listResult = await s3
        .listObjectsV2({
          Bucket: bucketName,
          MaxKeys: 1,
        })
        .promise();

      if (listResult.KeyCount && listResult.KeyCount > 0) {
        return NextResponse.json(
          {
            message:
              "Bucket is not empty. Use force=true to delete all contents first.",
            objectCount: listResult.KeyCount,
          },
          { status: 400 }
        );
      }
    }

    // Delete the bucket
    await s3.deleteBucket({ Bucket: bucketName }).promise();

    return NextResponse.json({
      message: force
        ? "Bucket and all contents deleted successfully"
        : "Empty bucket deleted successfully",
      deletedBucket: bucketName,
      ...(force && { objectsDeleted: true }),
    });
  } catch (error) {
    console.error("Error deleting bucket:", error);
    const awsError = error as AWS.AWSError;

    if (awsError.statusCode === 403) {
      return NextResponse.json(
        { message: "Access denied. Check AWS role permissions." },
        { status: 403 }
      );
    }

    if (awsError.code === "BucketNotEmpty") {
      return NextResponse.json(
        {
          message:
            "Bucket is not empty. Use force=true to delete all contents first.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        message: "Failed to delete bucket",
        error: awsError.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
