import { NextRequest, NextResponse } from "next/server";
import { getUserS3Client } from "@/lib/aws/s3";

export async function POST(req: NextRequest) {
  try {
    const {
      userId,
      bucketName,
      awsRegion,
      customRegion,
      versioning,
      encryptionType,
      bucketKey,
    } = await req.json();

    if (!userId || !bucketName || !awsRegion || !encryptionType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const region = awsRegion === "other" ? customRegion : awsRegion;
    if (!region) {
      return NextResponse.json({ error: "Invalid region" }, { status: 400 });
    }

    const s3 = await getUserS3Client(userId, region);

    // Step 1: Create Bucket
    const createParams: AWS.S3.CreateBucketRequest = {
      Bucket: bucketName,
    };

    // Add location constraint if region is not 'us-east-1'
    if (region !== "us-east-1") {
      createParams.CreateBucketConfiguration = { LocationConstraint: region };
    }

    await s3.createBucket(createParams).promise();

    // Step 2: Set Encryption
    const encryptionConfig =
      encryptionType === "sse-s3"
        ? {
            ServerSideEncryptionConfiguration: {
              Rules: [
                {
                  ApplyServerSideEncryptionByDefault: {
                    SSEAlgorithm: "AES256",
                  },
                  BucketKeyEnabled: bucketKey,
                },
              ],
            },
          }
        : {
            ServerSideEncryptionConfiguration: {
              Rules: [
                {
                  ApplyServerSideEncryptionByDefault: {
                    SSEAlgorithm: "aws:kms",
                  },
                  BucketKeyEnabled: bucketKey,
                },
              ],
            },
          };

    await s3
      .putBucketEncryption({
        Bucket: bucketName,
        ...encryptionConfig,
      })
      .promise();

    // Step 3: Enable Versioning if required
    if (versioning) {
      await s3
        .putBucketVersioning({
          Bucket: bucketName,
          VersioningConfiguration: { Status: "Enabled" },
        })
        .promise();
    }

    return NextResponse.json(
      { message: "Bucket created successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("[CREATE_BUCKET_ERROR]", err);
    return NextResponse.json(
      { error: "Failed to create bucket", details: err },
      { status: 500 }
    );
  }
}
