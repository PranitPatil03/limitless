"use client";

import "../../app/globals.css";
import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Image from "next/image";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { LoadingSpinner } from "../ui/spinner";
import { useAllBucketsWithDetails, type Bucket } from "@/lib/queries/bucket-queries";
import { RefreshCw, AlertCircle, CheckCircle, Clock, MoreVertical, Edit, Trash2, X, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AllBuckets() {
  const [search, setSearch] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedBucket, setSelectedBucket] = useState<string>("");
  const [editBucketName, setEditBucketName] = useState("");
  const [showErrorBanner, setShowErrorBanner] = useState(true);
  const [isCreatingBucket, setIsCreatingBucket] = useState(false);
  
  const [createForm, setCreateForm] = useState({
    bucketName: "",
    awsRegion: "us-east-1",
    customRegion: "",
    bucketType: "general-purpose",
    versioning: false,
    encryptionType: "sse-s3",
    bucketKey: true
  });
  
  const [bucketNameStatus, setBucketNameStatus] = useState<{
    status: 'unchecked' | 'checking' | 'available' | 'unavailable' | 'error';
    message: string;
  }>({ status: 'unchecked', message: '' });
  
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const userId = user?.id;

  const {
    buckets,
    isLoading,
    hasError,
    refetch,
    totalBuckets,
    loadedDetails
  } = useAllBucketsWithDetails(userId);

  console.log("Buckets data:", buckets);

  const filteredBuckets = useMemo(() => 
    buckets.filter((bucket: Bucket) =>
      bucket.name?.toLowerCase().includes(search.toLowerCase())
    ), [buckets, search]
  );

  const handleEditBucket = (bucketName: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setSelectedBucket(bucketName);
    setEditBucketName(bucketName);
    setShowEditModal(true);
  };

  const handleDeleteBucket = (bucketName: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setSelectedBucket(bucketName);
    setShowDeleteModal(true);
  };

  const handleCreateBucket = () => {
    setShowCreateModal(true);
  };

  const checkBucketNameAvailability = async () => {
    if (!createForm.bucketName.trim()) {
      setBucketNameStatus({
        status: 'error',
        message: 'Please enter a bucket name first'
      });
      return;
    }

    setBucketNameStatus({
      status: 'checking',
      message: 'Checking availability...'
    });

    try {
      const response = await fetch('/api/aws/check-bucket-name-available', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bucketName: createForm.bucketName.trim()
        })
      });

      const data = await response.json();

      if (response.ok) {
        if (data.available === true) {
          setBucketNameStatus({
            status: 'available',
            message: 'Bucket name is available!'
          });
        } else {
          setBucketNameStatus({
            status: 'unavailable',
            message: 'Bucket name is not available or already exists'
          });
        }
      } else {
        setBucketNameStatus({
          status: 'error',
          message: data.error || 'Error checking bucket name availability'
        });
      }
    } catch {
      setBucketNameStatus({
        status: 'error',
        message: 'Error checking availability. Please try again.'
      });
    }
  };

  const handleEditSubmit = () => {
    console.log("Edit bucket:", selectedBucket, "to:", editBucketName);
    // TODO: Implement actual edit functionality
    setShowEditModal(false);
    setSelectedBucket("");
    setEditBucketName("");
  };

  const handleDeleteConfirm = () => {
    console.log("Delete bucket:", selectedBucket);
    // TODO: Implement actual delete functionality
    setShowDeleteModal(false);
    setSelectedBucket("");
  };

  const handleCreateSubmit = async () => {
    if (!userId) {
      toast.error("User not authenticated");
      return;
    }

    if (!isCreateFormValid) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Check bucket name availability status
    if (bucketNameStatus.status === 'unavailable') {
      toast.error("Bucket name is not available. Please choose a different name.");
      return;
    }

    if (bucketNameStatus.status === 'error') {
      toast.error("Please check bucket name availability before creating");
      return;
    }

    // Recommend checking availability if not done yet
    if (bucketNameStatus.status === 'unchecked') {
      toast.error("Please check bucket name availability before creating");
      return;
    }

    setIsCreatingBucket(true);

    try {
      const response = await fetch('/api/aws/create-new-bucket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          bucketName: createForm.bucketName.trim(),
          awsRegion: createForm.awsRegion,
          customRegion: createForm.customRegion.trim(),
          versioning: createForm.versioning,
          encryptionType: createForm.encryptionType,
          bucketKey: createForm.bucketKey,
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Bucket created successfully!");
        setShowCreateModal(false);
        setCreateForm({
          bucketName: "",
          awsRegion: "us-east-1",
          customRegion: "",
          bucketType: "general-purpose",
          versioning: false,
          encryptionType: "sse-s3",
          bucketKey: true
        });
        setBucketNameStatus({ status: 'unchecked', message: '' });
        // Refresh the bucket list
        refetch();
      } else {
        toast.error(data.error || "Failed to create bucket");
      }
    } catch (error) {
      console.error("Error creating bucket:", error);
      toast.error("An error occurred while creating the bucket");
    } finally {
      setIsCreatingBucket(false);
    }
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setShowDeleteModal(false);
    setShowCreateModal(false);
    setSelectedBucket("");
    setEditBucketName("");
    setIsCreatingBucket(false);
    setCreateForm({
      bucketName: "",
      awsRegion: "us-east-1",
      customRegion: "",
      bucketType: "general-purpose",
      versioning: false,
      encryptionType: "sse-s3",
      bucketKey: true
    });
    setBucketNameStatus({ status: 'unchecked', message: '' });
  };

  const updateCreateForm = (field: string, value: string | boolean) => {
    setCreateForm(prev => {
      const updated = { ...prev, [field]: value };
      // Clear custom region when switching away from "other"
      if (field === "awsRegion" && value !== "other") {
        updated.customRegion = "";
      }
      return updated;
    });
    
    // Reset bucket name status when bucket name changes
    if (field === "bucketName") {
      setBucketNameStatus({ status: 'unchecked', message: '' });
    }
  };

  const isCreateFormValid = createForm.bucketName.trim().length > 0 && 
    (createForm.awsRegion !== "other" || createForm.customRegion.trim().length > 0) &&
    bucketNameStatus.status === 'available';

  if (hasError && buckets.length === 0 && !isLoading) {
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
    if (loadedDetails === totalBuckets && totalBuckets > 0) {
      return {
        icon: <CheckCircle className="h-3 w-3" />,
        text: "Fresh",
        color: "text-green-600"
      };
    }
    if (loadedDetails < totalBuckets && totalBuckets > 0) {
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
          {/* Only show bucket count when not on initial load */}
          {(!isLoading || buckets.length > 0) && (
            <span className="bg-muted px-2 py-0.5 rounded-full text-xs border">
              {totalBuckets} buckets
            </span>
          )}
          {/* Only show cache status when not on initial load */}
          {(!isLoading || buckets.length > 0) && (
            <div className={`flex items-center gap-1 text-xs ${cacheStatus.color}`}>
              {cacheStatus.icon}
              <span>{cacheStatus.text}</span>
            </div>
          )}
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
          </Button>
          
          <Button className="font-mono w-full sm:w-auto" onClick={handleCreateBucket}>
            <Plus className="h-4 w-4 mr-2" />
            Create Bucket
          </Button>
        </div>
      </div>

      {/* Error banner for partial failures */}
      {hasError && buckets.length > 0 && showErrorBanner && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg relative">
          <div className="flex items-center gap-2 pr-8">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <span className="text-sm text-yellow-800">
              Some bucket details failed to load. Data may be incomplete.
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 h-6 w-6 p-0 hover:bg-yellow-100"
            onClick={() => setShowErrorBanner(false)}
          >
            <X className="h-4 w-4 text-yellow-600" />
          </Button>
        </div>
      )}

      {isLoading && buckets.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <Card key={index} className="h-full p-5 animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-muted rounded-full p-2 w-10 h-10"></div>
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-3 bg-muted rounded w-20"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded"></div>
                <div className="h-3 bg-muted rounded"></div>
                <div className="h-3 bg-muted rounded"></div>
                <div className="h-3 bg-muted rounded w-3/4"></div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <>
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
              <Button className="font-mono" onClick={handleCreateBucket}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Bucket
              </Button>
            </div>
          )}

          {buckets.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
              {filteredBuckets.map((bucket: Bucket) => (
                <div key={bucket.name} className="relative">
                  <Link 
                    href={`/buckets/${bucket.name}`} 
                    className="transition-shadow block"
                  >
                    <Card className="h-full cursor-pointer flex flex-col justify-between p-5 hover:shadow-md transition-all duration-200 relative">
                      {bucket.region === "Loading..." && (
                        <div className="absolute top-2 right-8">
                          <LoadingSpinner className="h-3 w-3" />
                        </div>
                      )}
                      
                      <div className="absolute top-3 right-3 z-10">
                        <DropdownMenu>
                          <DropdownMenuTrigger 
                            asChild
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                          >
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 hover:bg-muted"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem 
                              onClick={(e) => handleEditBucket(bucket.name, e)}
                              className="cursor-pointer"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={(e) => handleDeleteBucket(bucket.name, e)}
                              className="cursor-pointer text-destructive focus:text-destructive"
                              variant="destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      
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
                </div>
              ))}
            </div>
          )}

          {search && buckets.length > 0 && (
            <div className="mt-6 text-center text-sm text-muted-foreground">
              {filteredBuckets.length === 0 ? (
                `No buckets found matching "${search}"`
              ) : (
                `Showing ${filteredBuckets.length} of ${buckets.length} buckets`
              )}
            </div>
          )}
        </>
      )}

      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Bucket Name</DialogTitle>
            <DialogDescription>
              Enter a new name for your bucket. This will rename the bucket.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label htmlFor="bucket-name" className="block text-sm font-medium mb-2">
              Bucket Name
            </label>
            <Input
              id="bucket-name"
              value={editBucketName}
              onChange={(e) => setEditBucketName(e.target.value)}
              placeholder="Enter bucket name"
              className="w-full"
            />
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button onClick={handleEditSubmit} disabled={!editBucketName.trim()}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete Bucket</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <span className="font-semibold">{selectedBucket}</span>?
              This action cannot be undone and all data in the bucket will be permanently lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete Bucket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Create S3 Bucket</DialogTitle>
            <DialogDescription>
              Configure your new S3 bucket with the settings below.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <label htmlFor="create-bucket-name" className="block text-sm font-medium">
                Bucket Name <span className="text-destructive">*</span>
              </label>
              <div className="flex gap-2">
                <Input
                  id="create-bucket-name"
                  value={createForm.bucketName}
                  onChange={(e) => updateCreateForm("bucketName", e.target.value)}
                  placeholder="Enter unique bucket name"
                  className="flex-1"
                  disabled={isCreatingBucket}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={checkBucketNameAvailability}
                  disabled={!createForm.bucketName.trim() || bucketNameStatus.status === 'checking' || isCreatingBucket}
                  className="min-w-[140px]"
                >
                  {bucketNameStatus.status === 'checking' ? (
                    <>
                      <LoadingSpinner className="h-4 w-4 mr-2" />
                      Checking...
                    </>
                  ) : (
                    'Check Availability'
                  )}
                </Button>
              </div>
              
              {/* Status Message */}
              {bucketNameStatus.status !== 'unchecked' && (
                <div className={`flex items-center gap-2 p-2 rounded text-sm ${
                  bucketNameStatus.status === 'available' 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : bucketNameStatus.status === 'unavailable'
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : bucketNameStatus.status === 'error'
                    ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                }`}>
                  {bucketNameStatus.status === 'available' && <CheckCircle className="h-4 w-4" />}
                  {bucketNameStatus.status === 'unavailable' && <X className="h-4 w-4" />}
                  {bucketNameStatus.status === 'error' && <AlertCircle className="h-4 w-4" />}
                  {bucketNameStatus.status === 'checking' && <Clock className="h-4 w-4" />}
                  <span>{bucketNameStatus.message}</span>
                </div>
              )}
              
              <p className="text-xs text-muted-foreground">
                Bucket names must be globally unique and follow S3 naming conventions.
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">AWS Region</label>
              <Select value={createForm.awsRegion} onValueChange={(value) => updateCreateForm("awsRegion", value)} disabled={isCreatingBucket}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select AWS Region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="us-east-1">US East (N. Virginia) - us-east-1</SelectItem>
                  <SelectItem value="us-east-2">US East (Ohio) - us-east-2</SelectItem>
                  <SelectItem value="us-west-1">US West (N. California) - us-west-1</SelectItem>
                  <SelectItem value="us-west-2">US West (Oregon) - us-west-2</SelectItem>
                  <SelectItem value="eu-west-1">Europe (Ireland) - eu-west-1</SelectItem>
                  <SelectItem value="eu-west-2">Europe (London) - eu-west-2</SelectItem>
                  <SelectItem value="eu-central-1">Europe (Frankfurt) - eu-central-1</SelectItem>
                  <SelectItem value="ap-southeast-1">Asia Pacific (Singapore) - ap-southeast-1</SelectItem>
                  <SelectItem value="ap-southeast-2">Asia Pacific (Sydney) - ap-southeast-2</SelectItem>
                  <SelectItem value="ap-northeast-1">Asia Pacific (Tokyo) - ap-northeast-1</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              
              {createForm.awsRegion === "other" && (
                <div className="mt-3">
                  <label htmlFor="custom-region" className="block text-sm font-medium mb-2">
                    Custom Region <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="custom-region"
                    value={createForm.customRegion}
                    onChange={(e) => updateCreateForm("customRegion", e.target.value)}
                    placeholder="Enter AWS region (e.g., us-gov-east-1, cn-north-1)"
                    className="w-full"
                    disabled={isCreatingBucket}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter the exact AWS region identifier for your custom region.
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium">Bucket Type</label>
              <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                <div className="flex-1">
                  <div className="font-medium text-sm">General Purpose</div>
                  <p className="text-xs text-muted-foreground">
                    Recommended for most use cases. Provides comprehensive S3 functionality.
                  </p>
                </div>
                <Switch
                  checked={createForm.bucketType === "general-purpose"}
                  onCheckedChange={(checked) => updateCreateForm("bucketType", checked ? "general-purpose" : "")}
                  disabled={isCreatingBucket}
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium">Bucket Versioning</label>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-sm">Enable Versioning</div>
                  <p className="text-xs text-muted-foreground">
                    Keep multiple versions of objects in the same bucket.
                  </p>
                </div>
                <Switch
                  checked={createForm.versioning}
                  onCheckedChange={(checked) => updateCreateForm("versioning", checked)}
                  disabled={isCreatingBucket}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-3">Default Encryption</label>
                <div className="space-y-3">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-sm font-medium">
                          Server-side encryption with Amazon S3 managed keys (SSE-S3)
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Default encryption using Amazon S3 managed keys. No additional cost.
                        </p>
                      </div>
                      <Switch
                        checked={createForm.encryptionType === "sse-s3"}
                        onCheckedChange={(checked) => {
                          if (checked) updateCreateForm("encryptionType", "sse-s3");
                        }}
                        disabled={isCreatingBucket}
                      />
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-sm font-medium">
                          Server-side encryption with AWS Key Management Service keys (SSE-KMS)
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Encryption using AWS KMS keys for enhanced security and control.
                        </p>
                      </div>
                      <Switch
                        checked={createForm.encryptionType === "sse-kms"}
                        onCheckedChange={(checked) => {
                          if (checked) updateCreateForm("encryptionType", "sse-kms");
                        }}
                        disabled={isCreatingBucket}
                      />
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-sm font-medium">
                          Dual-layer server-side encryption with AWS KMS keys (DSSE-KMS)
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Applies two layers of encryption for maximum security compliance.
                        </p>
                      </div>
                      <Switch
                        checked={createForm.encryptionType === "dsse-kms"}
                        onCheckedChange={(checked) => {
                          if (checked) updateCreateForm("encryptionType", "dsse-kms");
                        }}
                        disabled={isCreatingBucket}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium">Bucket Key</label>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-sm">Enable Bucket Key</div>
                    <p className="text-xs text-muted-foreground">
                      Reduces encryption costs by decreasing KMS requests. Recommended for most use cases.
                    </p>
                  </div>
                  <Switch
                    checked={createForm.bucketKey}
                    onCheckedChange={(checked) => updateCreateForm("bucketKey", checked)}
                    disabled={isCreatingBucket}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-2 pt-6 border-t">
            <Button variant="outline" onClick={handleCloseModal} disabled={isCreatingBucket}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateSubmit} 
              disabled={!isCreateFormValid || isCreatingBucket} 
              className="min-w-[120px]"
            >
              {isCreatingBucket ? (
                <>
                  <LoadingSpinner className="h-4 w-4 mr-2" />
                  Creating...
                </>
              ) : (
                'Create Bucket'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}