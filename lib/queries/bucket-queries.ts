import { useQuery, useQueryClient, useQueries } from "@tanstack/react-query";
import { getBucketDetails } from "@/lib/aws/get-bucket-detailes";
import { fetchUserBuckets } from "@/lib/aws/get-user-buckets";

// Query Keys - Centralized for consistency
export const bucketKeys = {
  all: ["buckets"] as const,
  userBuckets: (userId: string) => [...bucketKeys.all, "user", userId] as const,
  bucketDetails: (userId: string, bucketName: string) =>
    [...bucketKeys.all, "details", userId, bucketName] as const,
};

// Enhanced Bucket Interface
export interface Bucket {
  name: string;
  region?: string;
  privacy?: "Public" | "Private";
  files?: number;
  size?: string | number;
  created?: string;
}

// Utility function
function formatSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// Hook to fetch user buckets
export function useUserBuckets(userId: string | undefined) {
  return useQuery({
    queryKey: bucketKeys.userBuckets(userId || ""),
    queryFn: () => fetchUserBuckets(userId!),
    enabled: !!userId, // Only run when userId exists
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook to fetch bucket details
export function useBucketDetails(userId: string, bucketName: string) {
  return useQuery({
    queryKey: bucketKeys.bucketDetails(userId, bucketName),
    queryFn: () => getBucketDetails(userId, bucketName),
    enabled: !!userId && !!bucketName,
    staleTime: 3 * 60 * 1000, // 3 minutes (bucket details change more frequently)
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2, // Fewer retries for individual bucket details
  });
}

// Main hook that combines user buckets with their details
export function useAllBucketsWithDetails(userId: string | undefined) {
  const queryClient = useQueryClient();

  // First, get the list of user buckets
  const {
    data: userBuckets = [],
    isLoading: isBucketsLoading,
    error: bucketsError,
    refetch: refetchBuckets,
  } = useUserBuckets(userId);

  // Then, fetch details for each bucket using useQueries
  const bucketDetailQueries = useQueries({
    queries: userBuckets.map(
      (bucket: { name: string; privacy: "Public" | "Private" }) => ({
        queryKey: bucketKeys.bucketDetails(userId || "", bucket.name),
        queryFn: () => getBucketDetails(userId!, bucket.name),
        enabled: !!userId && !!bucket.name,
        staleTime: 3 * 60 * 1000,
        gcTime: 5 * 60 * 1000,
        retry: 1,
      })
    ),
  });

  // Combine the data
  const allBucketsWithDetails: Bucket[] = userBuckets.map(
    (
      bucket: {
        name: string;
        privacy: "Public" | "Private";
        region: string;
        files: number;
        size: number;
        created: string;
      },
      index: number
    ) => {
      const detailQuery = bucketDetailQueries[index];

      if (detailQuery.data) {
        return {
          name: bucket.name,
          region: bucket.region,
          privacy: bucket.privacy,
          files: bucket.files,
          size: formatSize(bucket.size || 0),
          created: new Date(bucket.created).toLocaleDateString(),
        };
      }

      // Return basic info if details are loading or failed
      return {
        name: bucket.name,
        privacy: bucket.privacy,
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

  // Manual refresh function
  const refreshAll = async () => {
    // Invalidate all bucket-related queries for this user
    await queryClient.invalidateQueries({
      queryKey: bucketKeys.userBuckets(userId || ""),
    });

    // Also invalidate all bucket details for this user
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
