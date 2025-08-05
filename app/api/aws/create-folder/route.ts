import { NextRequest, NextResponse } from "next/server";
import { getUserS3Client } from "@/lib/aws/s3";

export async function POST(req: NextRequest) {
  try {
    const { userId, bucketName, folderPath } = await req.json();

    if (!userId || !bucketName || !folderPath) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const s3 = await getUserS3Client(userId);

    // Create folder by uploading an empty object with the folder path
    // S3 doesn't have actual folders, so we create a placeholder object
    const folderKey = folderPath.endsWith("/") ? folderPath : `${folderPath}/`;

    await s3
      .putObject({
        Bucket: bucketName,
        Key: `${folderKey}.keep`, // Use .keep file to maintain folder structure
        Body: "",
        ContentType: "text/plain",
      })
      .promise();

    return NextResponse.json(
      { message: "Folder created successfully", folderPath: folderKey },
      { status: 200 }
    );
  } catch (error) {
    console.error("[CREATE_FOLDER_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to create folder", details: error },
      { status: 500 }
    );
  }
}
