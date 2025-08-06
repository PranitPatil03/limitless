"use client";
import Link from "next/link";
import React, { useState, useEffect, useCallback } from "react";
import { authClient } from "@/lib/auth-client";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PaintBucket,
  Files,
  HardDrive,
  Star,
  ImageIcon,
  Video,
  FileText,
  Archive,
  Music,
  Settings,
  TrendingUp,
  Database,
} from "lucide-react";

interface DashboardStats {
  totalBuckets: number;
  totalFiles: number;
  totalStorage: number;
  storageByType: {
    images: number;
    videos: number;
    documents: number;
    audio: number;
    archives: number;
    other: number;
  };
  recentActivity: number;
}

interface DashboardResponse {
  hasCredentials: boolean;
  stats: DashboardStats;
  error?: string;
}

export default function HomePage() {
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasCredentials, setHasCredentials] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardStats = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/aws/dashboard-stats?userId=${user.id}`);
      const data: DashboardResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch dashboard stats');
      }

      setHasCredentials(data.hasCredentials);
      setStats(data.stats);
      
      if (data.error) {
        setError(data.error);
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard stats');
      
      // Set default empty stats
      setStats({
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
      });
      setHasCredentials(false);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchDashboardStats();
    }
  }, [user?.id, fetchDashboardStats]);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStoragePercentage = (typeSize: number): number => {
    if (!stats?.totalStorage) return 0;
    return Math.round((typeSize / stats.totalStorage) * 100);
  };

  return (
    <div className="py-8 px-2 md:px-6 w-full max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-3 font-mono text-foreground">
          Welcome to Limitless
        </h1>
        <p className="text-muted-foreground text-lg font-mono">
          Your modern cloud file manager for AWS S3 buckets
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Buckets */}
        <Card className="p-6 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground font-mono">
                Total Buckets
              </p>
              {loading ? (
                <Skeleton className="h-8 w-16 mt-2" />
              ) : (
                <p className="text-3xl font-bold font-mono text-foreground">
                  {stats?.totalBuckets || 0}
                </p>
              )}
            </div>
            <div className="h-12 w-12 bg-muted rounded-xl flex items-center justify-center">
              <PaintBucket className="h-6 w-6 text-foreground" />
            </div>
          </div>
        </Card>

        {/* Total Files */}
        <Card className="p-6 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground font-mono">
                Total Files
              </p>
              {loading ? (
                <Skeleton className="h-8 w-20 mt-2" />
              ) : (
                <p className="text-3xl font-bold font-mono text-foreground">
                  {stats?.totalFiles.toLocaleString() || 0}
                </p>
              )}
            </div>
            <div className="h-12 w-12 bg-muted rounded-xl flex items-center justify-center">
              <Files className="h-6 w-6 text-foreground" />
            </div>
          </div>
        </Card>

        {/* Storage Used */}
        <Card className="p-6 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground font-mono">
                Storage Used
              </p>
              {loading ? (
                <Skeleton className="h-8 w-24 mt-2" />
              ) : (
                <p className="text-3xl font-bold font-mono text-foreground">
                  {formatBytes(stats?.totalStorage || 0)}
                </p>
              )}
            </div>
            <div className="h-12 w-12 bg-muted rounded-xl flex items-center justify-center">
              <HardDrive className="h-6 w-6 text-foreground" />
            </div>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-6 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground font-mono">
                Recent Activity
              </p>
              {loading ? (
                <Skeleton className="h-8 w-16 mt-2" />
              ) : (
                <p className="text-3xl font-bold font-mono text-foreground">
                  {stats?.recentActivity || 0}
                </p>
              )}
            </div>
            <div className="h-12 w-12 bg-muted rounded-xl flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-foreground" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <Card className="p-6 hover:shadow-lg transition-all duration-200">
          <h2 className="text-2xl font-semibold mb-6 font-mono flex items-center gap-2">
            <Star className="h-6 w-6 text-yellow-500" />
            Quick Actions
          </h2>
          <div className="space-y-4">
            <Button asChild className="w-full h-12 text-base font-mono" size="lg">
              <Link href="/buckets" className="flex items-center gap-3">
                <Database className="h-5 w-5" />
                Manage Buckets
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full h-12 text-base font-mono" size="lg">
              <Link href="/settings" className="flex items-center gap-3">
                <Settings className="h-5 w-5" />
                Configure AWS
              </Link>
            </Button>
          </div>
        </Card>

        {/* Storage Overview */}
        <Card className="p-6 hover:shadow-lg transition-all duration-200">
          <h2 className="text-2xl font-semibold mb-6 font-mono flex items-center gap-2">
            <HardDrive className="h-6 w-6 text-blue-500" />
            Storage Overview
          </h2>
          
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : (
            <div className="space-y-4">
              {stats && stats.totalStorage > 0 ? (
                <>
                  {/* Documents */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                        <FileText className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="font-medium font-mono">Documents</span>
                      <Badge variant="secondary" className="font-mono">
                        {getStoragePercentage(stats.storageByType.documents)}%
                      </Badge>
                    </div>
                    <span className="text-sm font-mono text-muted-foreground">
                      {formatBytes(stats.storageByType.documents)}
                    </span>
                  </div>
                  <Progress value={getStoragePercentage(stats.storageByType.documents)} className="h-2" />

                  {/* Images */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                        <ImageIcon className="h-4 w-4 text-green-600" />
                      </div>
                      <span className="font-medium font-mono">Images</span>
                      <Badge variant="secondary" className="font-mono">
                        {getStoragePercentage(stats.storageByType.images)}%
                      </Badge>
                    </div>
                    <span className="text-sm font-mono text-muted-foreground">
                      {formatBytes(stats.storageByType.images)}
                    </span>
                  </div>
                  <Progress value={getStoragePercentage(stats.storageByType.images)} className="h-2" />

                  {/* Videos */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                        <Video className="h-4 w-4 text-purple-600" />
                      </div>
                      <span className="font-medium font-mono">Videos</span>
                      <Badge variant="secondary" className="font-mono">
                        {getStoragePercentage(stats.storageByType.videos)}%
                      </Badge>
                    </div>
                    <span className="text-sm font-mono text-muted-foreground">
                      {formatBytes(stats.storageByType.videos)}
                    </span>
                  </div>
                  <Progress value={getStoragePercentage(stats.storageByType.videos)} className="h-2" />

                  {/* Audio */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-pink-100 dark:bg-pink-900/20 rounded-lg flex items-center justify-center">
                        <Music className="h-4 w-4 text-pink-600" />
                      </div>
                      <span className="font-medium font-mono">Audio</span>
                      <Badge variant="secondary" className="font-mono">
                        {getStoragePercentage(stats.storageByType.audio)}%
                      </Badge>
                    </div>
                    <span className="text-sm font-mono text-muted-foreground">
                      {formatBytes(stats.storageByType.audio)}
                    </span>
                  </div>
                  <Progress value={getStoragePercentage(stats.storageByType.audio)} className="h-2" />

                  {/* Archives */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                        <Archive className="h-4 w-4 text-orange-600" />
                      </div>
                      <span className="font-medium font-mono">Archives</span>
                      <Badge variant="secondary" className="font-mono">
                        {getStoragePercentage(stats.storageByType.archives)}%
                      </Badge>
                    </div>
                    <span className="text-sm font-mono text-muted-foreground">
                      {formatBytes(stats.storageByType.archives)}
                    </span>
                  </div>
                  <Progress value={getStoragePercentage(stats.storageByType.archives)} className="h-2" />
                </>
              ) : (
                <div className="text-center py-8">
                  <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  {!hasCredentials ? (
                    <>
                      <p className="text-muted-foreground font-mono mb-2">No AWS credentials configured</p>
                      <p className="text-sm text-muted-foreground font-mono mb-4">
                        Configure your AWS credentials to see storage insights
                      </p>
                      <Button asChild variant="outline" size="sm" className="font-mono">
                        <Link href="/settings">
                          <Settings className="h-4 w-4 mr-2" />
                          Configure AWS
                        </Link>
                      </Button>
                    </>
                  ) : error ? (
                    <>
                      <p className="text-muted-foreground font-mono mb-2">Could not load storage data</p>
                      <p className="text-sm text-muted-foreground font-mono mb-4">
                        {error}
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="font-mono"
                        onClick={fetchDashboardStats}
                      >
                        Try Again
                      </Button>
                    </>
                  ) : (
                    <>
                      <p className="text-muted-foreground font-mono">No storage data available</p>
                      <p className="text-sm text-muted-foreground font-mono mt-1">
                        Your S3 buckets appear to be empty
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
