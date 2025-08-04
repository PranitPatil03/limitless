// app/api/aws/get-bucket-contents/route.ts

import { getUserS3Client } from "@/lib/aws/s3";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const bucketName = searchParams.get("bucketName");
  const prefix = searchParams.get("prefix") || "";
  const delimiter = searchParams.get("delimiter") || "/";

  if (!userId || !bucketName) {
    return NextResponse.json(
      { message: "Missing userId or bucketName" },
      { status: 400 }
    );
  }

  try {
    const s3 = await getUserS3Client(userId);

    const { Buckets = [] } = await s3.listBuckets().promise();
    const bucket = Buckets.find((b) => b.Name === bucketName);

    if (!bucket) {
      return NextResponse.json(
        { message: "Bucket not found" },
        { status: 404 }
      );
    }

    const result = await s3
      .listObjectsV2({
        Bucket: bucketName,
        Prefix: prefix,
        Delimiter: delimiter,
        MaxKeys: 1000, // Limit for performance
      })
      .promise();

    // Extract folders from CommonPrefixes
    const folders = (result.CommonPrefixes || []).map((cp) => cp.Prefix!);

    // Extract files from Contents (excluding the prefix itself if it's a folder)
    const files = (result.Contents || [])
      .filter((obj) => obj.Key !== prefix) // Exclude the folder itself
      .map((obj) => ({
        key: obj.Key!,
        size: obj.Size || 0,
        lastModified: obj.LastModified?.toISOString() || "",
        storageClass: obj.StorageClass || "STANDARD",
      }));

    return NextResponse.json({
      folders,
      files,
      isTruncated: result.IsTruncated || false,
      nextContinuationToken: result.NextContinuationToken,
    });
  } catch (error) {
    console.error("Failed to fetch bucket contents:", error);
    return NextResponse.json(
      {
        message: "Internal Server Error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
