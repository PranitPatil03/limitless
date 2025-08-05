import { getUserS3Client } from "@/lib/aws/s3";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const bucketName = searchParams.get("bucketName");
  const key = searchParams.get("key");

  if (!userId || !bucketName || !key) {
    return NextResponse.json(
      { error: "Missing required parameters: userId, bucketName, or key" },
      { status: 400 }
    );
  }

  try {
    const s3 = await getUserS3Client(userId);

    // Check if the object exists
    try {
      await s3
        .headObject({
          Bucket: bucketName,
          Key: key,
        })
        .promise();
    } catch (error) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Generate a signed URL that expires in 1 hour
    const signedUrl = s3.getSignedUrl("getObject", {
      Bucket: bucketName,
      Key: key,
      Expires: 3600, // 1 hour
    });

    // For direct streaming, we can also return the file content directly
    // This is useful for images and other content that can be displayed inline
    const fileStream = s3
      .getObject({
        Bucket: bucketName,
        Key: key,
      })
      .createReadStream();

    // Get object metadata
    const metadata = await s3
      .headObject({
        Bucket: bucketName,
        Key: key,
      })
      .promise();

    const contentType = metadata.ContentType || "application/octet-stream";

    // For images, videos, and other previewable content, stream the file directly
    if (
      contentType.startsWith("image/") ||
      contentType.startsWith("video/") ||
      contentType.startsWith("audio/") ||
      contentType === "application/pdf"
    ) {
      // Convert stream to buffer for response
      const chunks: Buffer[] = [];

      return new Promise((resolve) => {
        fileStream.on("data", (chunk) => chunks.push(chunk));
        fileStream.on("end", () => {
          const buffer = Buffer.concat(chunks);

          resolve(
            new Response(buffer, {
              headers: {
                "Content-Type": contentType,
                "Content-Length": buffer.length.toString(),
                "Cache-Control": "public, max-age=3600",
                "Access-Control-Allow-Origin": "*",
              },
            })
          );
        });
        fileStream.on("error", () => {
          resolve(
            NextResponse.json({ error: "Failed to read file" }, { status: 500 })
          );
        });
      });
    }

    // For other file types, return the signed URL
    return NextResponse.json({
      url: signedUrl,
      contentType: contentType,
      size: metadata.ContentLength,
      lastModified: metadata.LastModified,
    });
  } catch (error) {
    console.error("Error getting file:", error);
    return NextResponse.json({ error: "Failed to get file" }, { status: 500 });
  }
}
