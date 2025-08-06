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

  interface DebugInfo {
    userId: string;
    bucketName: string;
    timestamp: string;
    checks: Record<string, unknown>;
    error?: string;
  }

  const debugInfo: DebugInfo = {
    userId,
    bucketName,
    timestamp: new Date().toISOString(),
    checks: {},
  };

  try {
    // Check 1: Can we create S3 client?
    let s3: AWS.S3;
    try {
      s3 = await getUserS3Client(userId);
      debugInfo.checks.s3ClientCreation = { success: true };
    } catch (error) {
      debugInfo.checks.s3ClientCreation = {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
      return NextResponse.json(debugInfo, { status: 500 });
    }

    // Check 2: Can we list buckets?
    try {
      const { Buckets = [] } = await s3.listBuckets().promise();
      debugInfo.checks.listBuckets = {
        success: true,
        totalBuckets: Buckets.length,
        bucketFound: Buckets.some((b) => b.Name === bucketName),
        allBuckets: Buckets.map((b) => b.Name),
      };
    } catch (error) {
      debugInfo.checks.listBuckets = {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }

    // Check 3: Can we access the specific bucket?
    try {
      await s3.headBucket({ Bucket: bucketName }).promise();
      debugInfo.checks.headBucket = { success: true };
    } catch (error: unknown) {
      const awsError = error as AWS.AWSError;
      debugInfo.checks.headBucket = {
        success: false,
        statusCode: awsError.statusCode,
        code: awsError.code,
        error: awsError.message,
      };
    }

    // Check 4: Can we get bucket location?
    try {
      const { LocationConstraint } = await s3
        .getBucketLocation({ Bucket: bucketName })
        .promise();
      debugInfo.checks.getBucketLocation = {
        success: true,
        region: LocationConstraint || "us-east-1",
      };
    } catch (error: unknown) {
      const awsError = error as AWS.AWSError;
      debugInfo.checks.getBucketLocation = {
        success: false,
        statusCode: awsError.statusCode,
        code: awsError.code,
        error: awsError.message,
      };
    }

    // Check 5: Can we list objects in the bucket?
    try {
      const result = await s3
        .listObjectsV2({
          Bucket: bucketName,
          MaxKeys: 1, // Just test with 1 object
        })
        .promise();
      debugInfo.checks.listObjects = {
        success: true,
        objectCount: result.KeyCount || 0,
      };
    } catch (error: unknown) {
      const awsError = error as AWS.AWSError;
      debugInfo.checks.listObjects = {
        success: false,
        statusCode: awsError.statusCode,
        code: awsError.code,
        error: awsError.message,
      };
    }

    return NextResponse.json(debugInfo);
  } catch (error) {
    console.error("Debug bucket access error:", error);
    debugInfo.error = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(debugInfo, { status: 500 });
  }
}
