import { getUserS3Client } from "@/lib/aws/s3";
import { NextRequest, NextResponse } from "next/server";
import * as AWS from "aws-sdk";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const bucketName = searchParams.get("bucketName");

  if (!userId || !bucketName) {
    return NextResponse.json(
      { message: "Missing userId or bucketName" },
      { status: 400 }
    );
  }

  try {
    const s3 = await getUserS3Client(userId);

    // First, try to check if bucket exists and is accessible
    try {
      await s3.headBucket({ Bucket: bucketName }).promise();
    } catch (headBucketError: unknown) {
      console.error("Bucket access error:", headBucketError);
      const awsError = headBucketError as AWS.AWSError;
      if (awsError.statusCode === 404) {
        return NextResponse.json(
          { message: "Bucket not found or not accessible" },
          { status: 404 }
        );
      }
      if (awsError.statusCode === 403) {
        return NextResponse.json(
          { message: "Access denied to bucket. Check AWS role permissions." },
          { status: 403 }
        );
      }
      throw headBucketError;
    }

    let region = "us-east-1";
    try {
      const { LocationConstraint } = await s3
        .getBucketLocation({ Bucket: bucketName })
        .promise();
      region = LocationConstraint || "us-east-1";
    } catch (locationError: unknown) {
      console.error(
        "Warning: Could not get bucket location, using default region:",
        locationError
      );
    }

    let creationDate: Date | null = null;
    try {
      const { Buckets = [] } = await s3.listBuckets().promise();
      const bucket = Buckets.find((b) => b.Name === bucketName);
      creationDate = bucket?.CreationDate || null;
    } catch (listError: unknown) {
      console.error(
        "Warning: Could not list buckets to get creation date:",
        listError
      );
    }
    const contents: AWS.S3.ObjectList = [];
    let isTruncated = true;
    let continuationToken: string | undefined = undefined;
    let totalSize = 0;
    let totalCount = 0;

    while (isTruncated) {
      const result = await s3
        .listObjectsV2({
          Bucket: bucketName,
          ContinuationToken: continuationToken,
        })
        .promise();

      const newContents = result.Contents || [];
      contents.push(...newContents);
      totalCount += newContents.length;
      totalSize += newContents.reduce((acc, obj) => acc + (obj.Size || 0), 0);

      isTruncated = result.IsTruncated || false;
      continuationToken = result.NextContinuationToken;
    }

    return NextResponse.json({
      name: bucketName,
      creationDate: creationDate,
      region: region,
      totalFiles: totalCount,
      totalSizeBytes: totalSize,
      files: contents.map((obj) => ({
        key: obj.Key,
        size: obj.Size,
        lastModified: obj.LastModified,
        storageClass: obj.StorageClass,
      })),
    });
  } catch (error) {
    console.error("Failed to fetch bucket metadata:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error },
      { status: 500 }
    );
  }
}
