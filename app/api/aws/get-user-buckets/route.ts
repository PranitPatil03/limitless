import { getUserS3Client } from "@/lib/aws/s3";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ message: "Missing userId" }, { status: 400 });
  }

  try {
    const s3 = await getUserS3Client(userId);
    const { Buckets = [] } = await s3.listBuckets().promise();

    const buckets = Buckets.map((bucket) => ({
      name: bucket.Name,
      createdAt: bucket.CreationDate,
    }));

    return NextResponse.json({ buckets }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch buckets:", error);
    return NextResponse.json(
      { message: error || "Internal Server Error" },
      { status: 500 }
    );
  }
}
