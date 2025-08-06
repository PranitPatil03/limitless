import { NextRequest, NextResponse } from "next/server";
import { getUserS3Client } from "@/lib/aws/s3";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId parameter" },
        { status: 400 }
      );
    }

    // Check if user has AWS credentials
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userroleaws: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // If no AWS credentials, return empty stats
    if (!user.userroleaws || user.userroleaws.length === 0) {
      return NextResponse.json({
        hasCredentials: false,
        stats: {
          totalBuckets: 0,
          totalFiles: 0,
          totalStorage: 0,
          storageByType: {
            images: 0,
            videos: 0,
            documents: 0,
            audio: 0,
            archives: 0,
            other: 0,
          },
          recentActivity: 0,
        },
      });
    }

    try {
      // Get S3 client and fetch buckets
      const s3 = await getUserS3Client(userId);
      const listBucketsResult = await s3.listBuckets().promise();
      const buckets = listBucketsResult.Buckets || [];

      let totalFiles = 0;
      let totalStorage = 0;
      const storageByType = {
        images: 0,
        videos: 0,
        documents: 0,
        audio: 0,
        archives: 0,
        other: 0,
      };

      // Fetch details for each bucket
      for (const bucket of buckets) {
        try {
          if (!bucket.Name) continue;

          // List all objects in the bucket
          const listObjectsResult = await s3
            .listObjectsV2({
              Bucket: bucket.Name,
            })
            .promise();

          const objects = listObjectsResult.Contents || [];
          totalFiles += objects.length;

          // Calculate storage and categorize by file type
          for (const obj of objects) {
            const size = obj.Size || 0;
            totalStorage += size;

            // Categorize by file extension
            const key = obj.Key || "";
            const extension = key.split(".").pop()?.toLowerCase() || "";

            if (
              ["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp"].includes(
                extension
              )
            ) {
              storageByType.images += size;
            } else if (
              ["mp4", "avi", "mov", "wmv", "flv", "webm", "mkv"].includes(
                extension
              )
            ) {
              storageByType.videos += size;
            } else if (
              [
                "pdf",
                "doc",
                "docx",
                "txt",
                "rtf",
                "odt",
                "xls",
                "xlsx",
                "ppt",
                "pptx",
              ].includes(extension)
            ) {
              storageByType.documents += size;
            } else if (
              ["mp3", "wav", "flac", "aac", "ogg", "wma"].includes(extension)
            ) {
              storageByType.audio += size;
            } else if (
              ["zip", "rar", "7z", "tar", "gz", "bz2", "xz"].includes(extension)
            ) {
              storageByType.archives += size;
            } else {
              storageByType.other += size;
            }
          }
        } catch (bucketError) {
          console.log(
            `Could not fetch details for bucket ${bucket.Name}:`,
            bucketError
          );
          // Continue with other buckets even if one fails
        }
      }

      // Calculate recent activity (files modified in last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      let recentActivity = 0;
      for (const bucket of buckets) {
        try {
          if (!bucket.Name) continue;

          const listObjectsResult = await s3
            .listObjectsV2({
              Bucket: bucket.Name,
            })
            .promise();

          const objects = listObjectsResult.Contents || [];
          recentActivity += objects.filter(
            (obj) =>
              obj.LastModified && new Date(obj.LastModified) > thirtyDaysAgo
          ).length;
        } catch (error) {
          // Continue with other buckets
        }
      }

      return NextResponse.json({
        hasCredentials: true,
        stats: {
          totalBuckets: buckets.length,
          totalFiles,
          totalStorage,
          storageByType,
          recentActivity,
        },
      });
    } catch (awsError) {
      console.error("AWS API Error:", awsError);

      // Return partial data if AWS calls fail
      return NextResponse.json({
        hasCredentials: true,
        stats: {
          totalBuckets: 0,
          totalFiles: 0,
          totalStorage: 0,
          storageByType: {
            images: 0,
            videos: 0,
            documents: 0,
            audio: 0,
            archives: 0,
            other: 0,
          },
          recentActivity: 0,
        },
        error:
          "Could not fetch AWS data. Please check your credentials and permissions.",
      });
    }
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch dashboard stats",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
