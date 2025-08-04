import { getUserS3Client } from "@/lib/aws/s3";
import { NextRequest, NextResponse } from "next/server";

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

    const { Buckets = [] } = await s3.listBuckets().promise();
    const bucket = Buckets.find((b) => b.Name === bucketName);

    if (!bucket) {
      return NextResponse.json(
        { message: "Bucket not found" },
        { status: 404 }
      );
    }

    const { LocationConstraint: region } = await s3
      .getBucketLocation({ Bucket: bucketName })
      .promise();
    if (!region) {
      return NextResponse.json(
        { message: "Bucket location not found" },
        { status: 404 }
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
      name: bucket.Name,
      creationDate: bucket.CreationDate,
      region: region || "us-east-1",
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
