"use client";

import "../../app/globals.css";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { getBucketDetails } from "@/lib/aws/get-bucket-detailes";
import { fetchUserBuckets } from "@/lib/aws/get-user-buckets";
import { LoadingSpinner } from "../ui/spinner";

export default function AllBuckets() {
  interface Bucket {
    name: string;
    region?: string;
    files?: number;
    size?: string | number;
    created?: string;
  }

  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const userId = user?.id;

  function formatSize(bytes: number) {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  const fetchBuckets = async () => {
    if (!userId) return;
    setLoading(true);

    try {
      const userBuckets = await fetchUserBuckets(userId);

      const detailedBuckets = await Promise.all(
        userBuckets.map(async (bucket: { name: string; privacy: "Public" | "Private" }) => {
          try {
            const detail = await getBucketDetails(userId, bucket.name);
            return {
              name: bucket.name,
              region: detail.region,
              privacy: bucket.privacy,
              files: detail.totalFiles,
              size: formatSize(detail.totalSizeBytes),
              created: new Date(detail.creationDate).toLocaleDateString(),
            };
          } catch (err) {
            console.warn(`Failed to get details for ${bucket.name}`, err);
            return {
              name: bucket.name,
              privacy: bucket.privacy,
              region: "-",
              files: "-",
              size: "-",
              created: "-",
            };
          }
        })
      );

      setBuckets(detailedBuckets);
    } catch (error) {
      console.error("Failed to fetch buckets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      setLoading(true);
      fetchBuckets();
    }
  }, [userId]);

  const filteredBuckets = buckets.filter((b) =>
    b.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="py-8 px-2 md:px-6 w-full max-w-7xl mx-auto font-mono">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 min-w-0">
          <h1 className="text-3xl font-bold truncate font-mono">
            S3 Buckets
          </h1>
          <span className="bg-muted px-2 py-0.5 rounded-full text-xs border">
            {buckets.length} buckets
          </span>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto items-stretch md:items-center">
          <input
            type="text"
            placeholder="Search buckets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-input rounded-lg px-3 py-2 w-full md:w-64 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono"
          />
          <Button className="sm:ml-2 font-mono w-full sm:w-auto">
            + Create Bucket
          </Button>
        </div>
      </div>
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <LoadingSpinner className="h-6 w-6" />
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
        {filteredBuckets.map((bucket) => (
          <Link href={`/buckets/${bucket.name}`} key={bucket.name} className="transition-shadow">
            <Card className="h-full cursor-pointer flex flex-col justify-between p-5 hover:shadow-md transition-all duration-200">
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
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
