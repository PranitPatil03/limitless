"use client"

import Link from "next/link";
import React from "react";

export default function HomePage() {
  return (
    <div className="py-8 px-2 md:px-6 w-full max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 font-mono">
          Welcome to Limitless
        </h1>
        <p className="text-muted-foreground text-lg font-mono">
          Your modern cloud file manager for AWS S3 buckets
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-card rounded-xl shadow p-6 flex flex-col justify-between">
          <div className="text-muted-foreground text-sm mb-1 font-mono">
            Total Files
          </div>
          <div className="text-2xl font-bold font-mono">1,234</div>
          <div className="text-xs text-green-600 mt-1 font-mono">
            +12% from last month
          </div>
        </div>
        <div className="bg-white dark:bg-card rounded-xl shadow p-6 flex flex-col justify-between">
          <div className="text-muted-foreground text-sm mb-1 font-mono">
            Storage Used
          </div>
          <div className="text-2xl font-bold font-mono">2.1GB</div>
          <div className="text-xs text-green-600 mt-1 font-mono">
            +5% from last month
          </div>
        </div>
        <div className="bg-white dark:bg-card rounded-xl shadow p-6 flex flex-col justify-between">
          <div className="text-muted-foreground text-sm mb-1 font-mono">
            Buckets
          </div>
          <div className="text-2xl font-bold font-mono">8</div>
          <div className="text-xs text-green-600 mt-1 font-mono">
            +2 from last month
          </div>
        </div>
        <div className="bg-white dark:bg-card rounded-xl shadow p-6 flex flex-col justify-between">
          <div className="text-muted-foreground text-sm mb-1 font-mono">
            Monthly Uploads
          </div>
          <div className="text-2xl font-bold font-mono">156</div>
          <div className="text-xs text-orange-600 mt-1 font-mono">
            +23% from last month
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-card rounded-xl shadow p-6 flex flex-col justify-between">
          <h2 className="text-xl font-semibold mb-4 font-mono">
            Quick Actions
          </h2>
          <div className="flex flex-col gap-2">
            <Link
              href="/files"
              className="bg-primary text-white rounded-lg px-4 py-2 font-medium flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono"
            >
              Manage Files
            </Link>
            <Link
              href="/settings"
              className="bg-muted rounded-lg px-4 py-2 font-medium flex items-center gap-2 text-muted-foreground font-mono"
            >
              Configure AWS
            </Link>
            <Link
              href="/activity"
              className="bg-muted rounded-lg px-4 py-2 font-medium flex items-center gap-2 text-muted-foreground font-mono"
            >
              View Activity
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-card rounded-xl shadow p-6 flex flex-col justify-between">
          <h2 className="text-xl font-semibold mb-4 font-mono">
            Storage Overview
          </h2>
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-muted-foreground font-mono">
                Used Storage
              </span>
              <span className="text-sm font-medium font-mono">2.1GB / 5GB</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 mb-2">
              <div
                className="bg-primary h-2 rounded-full"
                style={{ width: "42%" }}
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-mono">
              <span>Documents</span>
              <span>1.2 GB</span>
            </div>
            <div className="flex justify-between text-sm font-mono">
              <span>Images</span>
              <span>650 MB</span>
            </div>
            <div className="flex justify-between text-sm font-mono">
              <span>Videos</span>
              <span>250 MB</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
