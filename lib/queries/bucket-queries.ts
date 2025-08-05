import { useQuery, useQueryClient, useQueries } from "@tanstack/react-query";
import { getBucketDetails } from "@/lib/aws/get-bucket-detailes";
import { fetchUserBuckets } from "@/lib/aws/get-user-buckets";

export const bucketKeys = {
  all: ["buckets"] as const,
  userBuckets: (userId: string) => [...bucketKeys.all, "user", userId] as const,
  bucketDetails: (userId: string, bucketName: string) =>
    [...bucketKeys.all, "details", userId, bucketName] as const,
};

export interface UserBucket {
  name: string;
  privacy?: "Public" | "Private";
}

export interface BucketDetailsResponse {
  region?: string;
  privacy?: "Public" | "Private";
  totalFiles?: number;
  files?: number;
  totalSizeBytes?: number;
  size?: number;
  creationDate?: string;
  created?: string;
  // Add other properties your API might return
  [key: string]: unknown; // Allow for additional unknown properties
}

export interface Bucket {
  name: string;
  region?: string;
  privacy?: "Public" | "Private";
  files?: number | string;
  size?: string;
  created?: string;
}

function formatSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function useUserBuckets(userId: string | undefined) {
  return useQuery<UserBucket[]>({
    queryKey: bucketKeys.userBuckets(userId || ""),
    queryFn: () => fetchUserBuckets(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useBucketDetails(userId: string, bucketName: string) {
  return useQuery<BucketDetailsResponse>({
    queryKey: bucketKeys.bucketDetails(userId, bucketName),
    queryFn: () => getBucketDetails(userId, bucketName),
    enabled: !!userId && !!bucketName,
    staleTime: 3 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
  });
}

export function useAllBucketsWithDetails(userId: string | undefined) {
  const queryClient = useQueryClient();

  const {
    data: userBuckets = [],
    isLoading: isBucketsLoading,
    error: bucketsError,
    refetch: refetchBuckets,
  } = useUserBuckets(userId);

  const bucketDetailQueries = useQueries({
    queries: userBuckets.map((bucket: UserBucket) => ({
      queryKey: bucketKeys.bucketDetails(userId || "", bucket.name),
      queryFn: (): Promise<BucketDetailsResponse> =>
        getBucketDetails(userId!, bucket.name),
      enabled: !!userId && !!bucket.name,
      staleTime: 3 * 60 * 1000,
      gcTime: 5 * 60 * 1000,
      retry: 1,
    })),
  });

  const allBucketsWithDetails: Bucket[] = userBuckets.map(
    (bucket: UserBucket, index: number) => {
      const detailQuery = bucketDetailQueries[index];
      const detailData = detailQuery.data as BucketDetailsResponse | undefined;

      if (detailData) {
        // Handle different possible property names from your API
        const sizeBytes = detailData.totalSizeBytes || detailData.size || 0;
        const fileCount = detailData.totalFiles || detailData.files || 0;
        const creationDate = detailData.creationDate || detailData.created;

        return {
          name: bucket.name,
          region: detailData.region || "-",
          privacy: bucket.privacy || detailData.privacy || "Private",
          files: fileCount,
          size: formatSize(typeof sizeBytes === "number" ? sizeBytes : 0),
          created: creationDate
            ? new Date(creationDate).toLocaleDateString()
            : "-",
        };
      }

      // Return basic info with loading states
      return {
        name: bucket.name,
        privacy: bucket.privacy || "Private",
        region: detailQuery.isLoading ? "Loading..." : "-",
        files: detailQuery.isLoading ? "Loading..." : "-",
        size: detailQuery.isLoading ? "Loading..." : "-",
        created: detailQuery.isLoading ? "Loading..." : "-",
      };
    }
  );

  const isLoading =
    isBucketsLoading || bucketDetailQueries.some((query) => query.isLoading);
  const hasError =
    !!bucketsError || bucketDetailQueries.some((query) => query.error);
  const errors = [
    bucketsError,
    ...bucketDetailQueries.map((q) => q.error),
  ].filter(Boolean);

  const refreshAll = async () => {
    await queryClient.invalidateQueries({
      queryKey: bucketKeys.userBuckets(userId || ""),
    });

    await queryClient.invalidateQueries({
      queryKey: [...bucketKeys.all, "details", userId],
    });
  };

  return {
    buckets: allBucketsWithDetails,
    isLoading,
    hasError,
    errors,
    refetch: refreshAll,
    totalBuckets: userBuckets.length,
    loadedDetails: bucketDetailQueries.filter((q) => q.data).length,
  };
}
