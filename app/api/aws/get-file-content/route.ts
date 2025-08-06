import { getUserS3Client } from "@/lib/aws/s3";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const bucketName = searchParams.get("bucketName");
  const key = searchParams.get("key");
  const type = searchParams.get("type") || "preview"; // preview or download

  if (!userId || !bucketName || !key) {
    return NextResponse.json(
      { error: "Missing required parameters: userId, bucketName, or key" },
      { status: 400 }
    );
  }

  try {
    const s3 = await getUserS3Client(userId);

    // Get the object and its metadata
    let fileObject;
    try {
      fileObject = await s3
        .getObject({
          Bucket: bucketName,
          Key: key,
        })
        .promise();
    } catch (error) {
      console.error("File not found:", error);
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    if (!fileObject.Body) {
      return NextResponse.json(
        { error: "File content not found" },
        { status: 404 }
      );
    }

    const contentType = fileObject.ContentType || "application/octet-stream";
    const fileName = key.split("/").pop() || "download";

    // Convert Body to Buffer
    const buffer = Buffer.isBuffer(fileObject.Body)
      ? fileObject.Body
      : Buffer.from(fileObject.Body as Uint8Array);

    // Set headers based on the request type
    const headers: Record<string, string> = {
      "Content-Type": contentType,
      "Content-Length": buffer.length.toString(),
      "Cache-Control": "public, max-age=3600",
    };

    // For downloads, add Content-Disposition header
    if (type === "download") {
      headers["Content-Disposition"] = `attachment; filename="${fileName}"`;
    } else {
      // For text files, ensure proper content type for preview
      if (
        contentType.startsWith("text/") ||
        fileName.endsWith(".json") ||
        fileName.endsWith(".md") ||
        fileName.endsWith(".txt") ||
        fileName.endsWith(".csv") ||
        fileName.endsWith(".log")
      ) {
        headers["Content-Type"] = "text/plain; charset=utf-8";
      }
    }

    return new Response(new Uint8Array(buffer), { headers });
  } catch (error) {
    console.error("Error getting file content:", error);
    return NextResponse.json(
      { error: "Failed to get file content" },
      { status: 500 }
    );
  }
}
