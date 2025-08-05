import { S3 } from "aws-sdk";
import { NextResponse } from "next/server";

const s3 = new S3();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { bucketName } = body;

    if (!bucketName) {
      return NextResponse.json(
        { error: "bucketName is required" },
        { status: 400 }
      );
    }

    const isAvailable = await checkBucketNameAvailability(bucketName);

    return NextResponse.json({ available: isAvailable }, { status: 200 });
  } catch (err) {
    console.error("[CHECK_BUCKET_ERROR]", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

const checkBucketNameAvailability = async (
  bucketName: string
): Promise<boolean> => {
  try {
    await s3.headBucket({ Bucket: bucketName }).promise();
    return false;
  } catch (err: unknown) {
    let statusCode: number | undefined = undefined;
    if (typeof err === "object" && err !== null && "statusCode" in err) {
      statusCode = (err as { statusCode?: number }).statusCode;
    }

    if (statusCode === 404) {
      return true;
    } else if (statusCode === 403) {
      return false;
    } else {
      console.error("[HEAD_BUCKET_ERROR]", err);
      return false;
    }
  }
};


