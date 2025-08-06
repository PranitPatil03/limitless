import { getUserS3Client } from "@/lib/aws/s3";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const bucketName = searchParams.get("bucketName");
  const key = searchParams.get("key");
  const download = searchParams.get("download") === "true";

  if (!userId || !bucketName || !key) {
    return NextResponse.json(
      { error: "Missing required parameters: userId, bucketName, or key" },
      { status: 400 }
    );
  }

  try {
    const s3 = await getUserS3Client(userId);

    // Check if the object exists and get metadata
    let metadata;
    try {
      metadata = await s3
        .headObject({
          Bucket: bucketName,
          Key: key,
        })
        .promise();
    } catch (error) {
      console.error("File not found:", error);
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const contentType = metadata.ContentType || "application/octet-stream";

    // For preview purposes, stream the file content directly
    if (!download) {
      try {
        const fileObject = await s3
          .getObject({
            Bucket: bucketName,
            Key: key,
          })
          .promise();

        if (!fileObject.Body) {
          return NextResponse.json(
            { error: "File content not found" },
            { status: 404 }
          );
        }

        // Convert Body to Buffer
        const buffer = Buffer.isBuffer(fileObject.Body)
          ? fileObject.Body
          : Buffer.from(fileObject.Body as Uint8Array);

        // Set appropriate headers for different file types
        const headers: Record<string, string> = {
          "Content-Type": contentType,
          "Content-Length": buffer.length.toString(),
          "Cache-Control": "public, max-age=3600",
        };

        // For downloads, add Content-Disposition header
        if (download) {
          headers["Content-Disposition"] = `attachment; filename="${
            key.split("/").pop() || "download"
          }"`;
        }

        return new Response(new Uint8Array(buffer), { headers });
      } catch (error) {
        console.error("Error streaming file:", error);
        // Fallback to signed URL if streaming fails
      }
    }

    // Generate a signed URL for downloads or as fallback
    const signedUrl = s3.getSignedUrl("getObject", {
      Bucket: bucketName,
      Key: key,
      Expires: 3600,
      ResponseContentDisposition: download
        ? `attachment; filename="${key.split("/").pop() || "download"}"`
        : undefined,
    });

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
