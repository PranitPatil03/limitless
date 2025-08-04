"use client";

import "../../app/globals.css";
import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { LoadingSpinner } from "../ui/spinner";
import { useAllBucketsWithDetails, type Bucket } from "@/lib/queries/bucket-queries";
import { RefreshCw, AlertCircle, CheckCircle, Clock } from "lucide-react";

export default function AllBuckets() {
  const [search, setSearch] = useState("");
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const userId = user?.id;

  // Use React Query hook
  const {
    buckets,
    isLoading,
    hasError,
    errors,
    refetch,
    totalBuckets,
    loadedDetails
  } = useAllBucketsWithDetails(userId);

  // Memoize filtered buckets to avoid recalculation
  const filteredBuckets = useMemo(() => 
    buckets.filter((bucket: Bucket) =>
      bucket.name?.toLowerCase().includes(search.toLowerCase())
    ), [buckets, search]
  );

  // Loading state
  if (isLoading && buckets.length === 0) {
    return (
      <div className="py-8 px-2 md:px-6 w-full max-w-7xl mx-auto font-mono">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <LoadingSpinner className="h-8 w-8 mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your S3 buckets...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (hasError && buckets.length === 0) {
    return (
      <div className="py-8 px-2 md:px-6 w-full max-w-7xl mx-auto font-mono">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 mx-auto mb-4 text-destructive" />
            <p className="text-destructive mb-4">Failed to load buckets</p>
            <Button onClick={() => refetch()} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const getCacheStatus = () => {
    if (isLoading && buckets.length > 0) {
      return {
        icon: <Clock className="h-3 w-3" />,
        text: "Refreshing...",
        color: "text-yellow-600"
      };
    }
    if (loadedDetails === totalBuckets) {
      return {
        icon: <CheckCircle className="h-3 w-3" />,
        text: "Fresh",
        color: "text-green-600"
      };
    }
    if (loadedDetails < totalBuckets) {
      return {
        icon: <Clock className="h-3 w-3" />,
        text: `Loading ${loadedDetails}/${totalBuckets}`,
        color: "text-blue-600"
      };
    }
    return {
      icon: <CheckCircle className="h-3 w-3" />,
      text: "Cached",
      color: "text-gray-600"
    };
  };

  const cacheStatus = getCacheStatus();

  return (
    <div className="py-8 px-2 md:px-6 w-full max-w-7xl mx-auto font-mono">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 min-w-0">
          <h1 className="text-3xl font-bold truncate font-mono">
            S3 Buckets
          </h1>
          <span className="bg-muted px-2 py-0.5 rounded-full text-xs border">
            {totalBuckets} buckets
          </span>
          <div className={`flex items-center gap-1 text-xs ${cacheStatus.color}`}>
            {cacheStatus.icon}
            <span>{cacheStatus.text}</span>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto items-stretch md:items-center">
          <input
            type="text"
            placeholder="Search buckets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-input rounded-lg px-3 py-2 w-full md:w-64 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono"
          />
          
          <Button 
            onClick={() => refetch()}
            variant="outline"
            disabled={isLoading}
            className="font-mono flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? "Refreshing..." : "Refresh"}
          </Button>
          
          <Button className="font-mono w-full sm:w-auto">
            + Create Bucket
          </Button>
        </div>
      </div>

      {/* Error banner for partial failures */}
      {hasError && buckets.length > 0 && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <span className="text-sm text-yellow-800">
              Some bucket details failed to load. Data may be incomplete.
            </span>
          </div>
        </div>
      )}

      {/* Loading overlay for background refresh */}
      {isLoading && buckets.length > 0 && (
        <div className="fixed top-4 right-4 z-50 bg-background border rounded-lg p-3 shadow-lg">
          <div className="flex items-center gap-2">
            <LoadingSpinner className="h-4 w-4" />
            <span className="text-sm">Updating buckets...</span>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && buckets.length === 0 && (
        <div className="text-center py-12">
          <div className="mb-4">
            <Image 
              src="/file.svg" 
              alt="No buckets" 
              width={64} 
              height={64} 
              className="mx-auto opacity-50"
            />
          </div>
          <h3 className="text-lg font-semibold mb-2">No S3 buckets found</h3>
          <p className="text-muted-foreground mb-4">
            Create your first bucket to get started with cloud storage.
          </p>
          <Button className="font-mono">
            + Create Your First Bucket
          </Button>
        </div>
      )}

      {/* Buckets grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
        {filteredBuckets.map((bucket: Bucket) => (
          <Link 
            href={`/buckets/${bucket.name}`} 
            key={bucket.name} 
            className="transition-shadow"
          >
            <Card className="h-full cursor-pointer flex flex-col justify-between p-5 hover:shadow-md transition-all duration-200 relative">
              {/* Loading indicator for individual bucket */}
              {bucket.region === "Loading..." && (
                <div className="absolute top-2 right-2">
                  <LoadingSpinner className="h-3 w-3" />
                </div>
              )}
              
              <div className="flex items-center gap-3 min-w-0 mb-2">
                <span className="bg-muted rounded-full p-2 flex items-center justify-center">
                  <Image src="/file.svg" alt="Bucket" width={24} height={24} />
                </span>
                <span className="text-lg font-semibold truncate flex-1 min-w-0">
                  {bucket.name}
                  <div className="text-xs text-muted-foreground mb-2 truncate">
                    {bucket.region}
                  </div>
                </span>
              </div>

              <div className="flex flex-col gap-1 text-sm">
                <div>
                  <span className="text-muted-foreground">Files</span>:{" "}
                  <span className="font-semibold">{bucket.files ?? "-"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Size</span>:{" "}
                  <span className="font-semibold">{bucket.size ?? "-"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Created</span>:{" "}
                  <span className="font-semibold">{bucket.created ?? "-"}</span>
                </div>
                {bucket.privacy && (
                  <div>
                    <span className="text-muted-foreground">Privacy</span>:{" "}
                    <span className={`font-semibold ${
                      bucket.privacy === 'Public' ? 'text-orange-600' : 'text-green-600'
                    }`}>
                      {bucket.privacy}
                    </span>
                  </div>
                )}
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Search results info */}
      {search && (
        <div className="mt-6 text-center text-sm text-muted-foreground">
          {filteredBuckets.length === 0 ? (
            `No buckets found matching "${search}"`
          ) : (
            `Showing ${filteredBuckets.length} of ${buckets.length} buckets`
          )}
        </div>
      )}
    </div>
  );
}