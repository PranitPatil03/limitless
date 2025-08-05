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

    // Check if the object exists and get metadata
    let metadata;
    try {
      metadata = await s3
        .headObject({
          Bucket: bucketName,
          Key: key,
        })
        .promise();
    } catch (err) {
      console.error("Error checking file:", err);
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Get the file stream
    const fileStream = s3
      .getObject({
        Bucket: bucketName,
        Key: key,
      })
      .createReadStream();

    const contentType = metadata.ContentType || "application/octet-stream";
    const fileName = key.split("/").pop() || "download";

    // Convert stream to buffer
    const chunks: Buffer[] = [];

    return new Promise((resolve) => {
      fileStream.on("data", (chunk) => chunks.push(chunk));
      fileStream.on("end", () => {
        const buffer = Buffer.concat(chunks);

        resolve(
          new Response(buffer, {
            headers: {
              "Content-Type": contentType,
              "Content-Disposition": `attachment; filename="${fileName}"`,
              "Content-Length": buffer.length.toString(),
              "Cache-Control": "private, no-cache",
            },
          })
        );
      });
      fileStream.on("error", (error) => {
        console.error("Stream error:", error);
        resolve(
          NextResponse.json(
            { error: "Failed to download file" },
            { status: 500 }
          )
        );
      });
    });
  } catch (error) {
    console.error("Error downloading file:", error);
    return NextResponse.json(
      { error: "Failed to download file" },
      { status: 500 }
    );
  }
}
