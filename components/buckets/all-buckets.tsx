"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const buckets = [
  {
    name: "my-production-bucket",
    region: "us-east-1",
    files: 1247,
    size: "2.4 GB",
    created: "2 months ago",
    privacy: "Private",
  },
  {
    name: "user-uploads",
    region: "us-west-2",
    files: 856,
    size: "1.8 GB",
    created: "3 months ago",
    privacy: "Public",
  },
  {
    name: "backups-archive",
    region: "eu-west-1",
    files: 423,
    size: "5.2 GB",
    created: "6 months ago",
    privacy: "Private",
  },
  {
    name: "static-assets",
    region: "us-east-1",
    files: 2341,
    size: "856 MB",
    created: "1 year ago",
    privacy: "Public",
  },
];

const privacyIcon = {
  Public: "/globe.svg",
  Private: "/window.svg",
};

export default function AllBuckets() {
  const [search, setSearch] = useState("");
  const filteredBuckets = buckets.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase())
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
              <div className="flex flex-col gap-3 justify-between items-start">
                <Badge
                  variant={bucket.privacy === "Public" ? "default" : "outline"}
                  className="ml-2 flex items-center gap-1 px-2 py-0.5 text-xs"
                >
                  <Image
                    src={
                      privacyIcon[bucket.privacy as keyof typeof privacyIcon]
                    }
                    alt={bucket.privacy}
                    width={8}
                    height={8}
                  />
                  {bucket.privacy}
                </Badge>
              </div>

              <div className="flex flex-col gap-1 text-sm">
                <div>
                  <span className="text-muted-foreground">Files</span>:{" "}
                  <span className="font-semibold">{bucket.files}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Size</span>:{" "}
                  <span className="font-semibold">{bucket.size}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Created</span>:{" "}
                  <span className="font-semibold">{bucket.created}</span>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
