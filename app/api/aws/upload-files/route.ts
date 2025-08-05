import { NextRequest, NextResponse } from "next/server";
import { getUserS3Client } from "@/lib/aws/s3";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const userId = formData.get("userId") as string;
    const bucketName = formData.get("bucketName") as string;
    const currentPath = (formData.get("currentPath") as string) || "";
    const files = formData.getAll("files") as File[];

    if (!userId || !bucketName || !files || files.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields or no files provided" },
        { status: 400 }
      );
    }

    const s3 = await getUserS3Client(userId);
    const uploadedFiles = [];

    for (const file of files) {
      const fileKey = `${currentPath}${file.name}`;
      const fileBuffer = await file.arrayBuffer();

      await s3
        .putObject({
          Bucket: bucketName,
          Key: fileKey,
          Body: Buffer.from(fileBuffer),
          ContentType: file.type || "application/octet-stream",
        })
        .promise();

      uploadedFiles.push({
        name: file.name,
        key: fileKey,
        size: file.size,
        type: file.type,
      });
    }

    return NextResponse.json(
      {
        message: `${uploadedFiles.length} file(s) uploaded successfully`,
        files: uploadedFiles,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[UPLOAD_FILES_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to upload files", details: error },
      { status: 500 }
    );
  }
}
