"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Folder } from "lucide-react";

import {
  BucketDetailProps,
  BucketContentsResponse,
  S3Item,
  SortOption,
  SortDirection,
  FilterOption,
  ViewMode,
} from "./types";
import { formatFileSize, formatDate, getFileIcon, getFileType } from "./utils";

import { BucketHeader } from "./bucket-header";
import { BucketControls } from "./bucket-controls";
import { FileGrid } from "./file-grid";
import { FileList } from "./file-list";
import { FilePreviewModal } from "./file-preview-modal";
import { UploadModal } from "./upload-modal";
import { DeleteConfirmationModal } from "./delete-confirmation-modal";
import { EmptyState, LoadingState, LoadingMoreState, ErrorState } from "./bucket-states";

export default function BucketDetail({ bucketId, userId }: BucketDetailProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPath, setCurrentPath] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [filterBy, setFilterBy] = useState<FilterOption>("all");
  const [items, setItems] = useState<S3Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  
  const [previewFile, setPreviewFile] = useState<S3Item | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [textContent, setTextContent] = useState<string>("");
  const [loadingContent, setLoadingContent] = useState(false);
  
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTab, setUploadTab] = useState<"files" | "folder">("files");
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [folderName, setFolderName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteItem, setDeleteItem] = useState<S3Item | null>(null);
  const [deleteType, setDeleteType] = useState<"file" | "folder" | "bucket">("file");
  const [isDeleting, setIsDeleting] = useState(false);

  const breadcrumbs = currentPath.split("/").filter(Boolean);
  
  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    let matchesFilter = true;
    if (filterBy === "folders") matchesFilter = item.type === "folder";
    else if (filterBy === "files") matchesFilter = item.type === "file";
    else if (filterBy !== "all") matchesFilter = item.fileType === filterBy;

    return matchesSearch && matchesFilter;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    // Always put folders first
    if (a.type === "folder" && b.type === "file") return -1;
    if (a.type === "file" && b.type === "folder") return 1;

    let comparison = 0;

    switch (sortBy) {
      case "name":
        comparison = a.name.localeCompare(b.name);
        break;
      case "size":
        const sizeA = a.sizeBytes || 0;
        const sizeB = b.sizeBytes || 0;
        comparison = sizeA - sizeB;
        break;
      case "modified":
        comparison = (a.lastModified || "").localeCompare(b.lastModified || "");
        break;
      case "type":
        comparison = (a.fileType || "").localeCompare(b.fileType || "");
        break;
    }

    return sortDirection === "asc" ? comparison : -comparison;
  });

  const folders = sortedItems.filter((item) => item.type === "folder");
  const files = sortedItems.filter((item) => item.type === "file");

  // Fetch bucket contents for current path
  const fetchBucketContents = useCallback(
    async (path: string = currentPath) => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/aws/get-bucket-contents?userId=${encodeURIComponent(
            userId
          )}&bucketName=${encodeURIComponent(
            bucketId
          )}&prefix=${encodeURIComponent(path)}`
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch bucket contents: ${response.statusText}`
          );
        }

        const data: BucketContentsResponse = await response.json();

        // Process folders
        const folderItems: S3Item[] = data.folders.map((folderKey) => {
          const folderName = folderKey.slice(path.length).replace("/", "");
          return {
            key: folderKey,
            name: folderName,
            type: "folder" as const,
            icon: Folder,
            fileType: "folder",
          };
        });

        // Process files
        const fileItems: S3Item[] = data.files.map((file) => {
          const fileName = file.key.slice(path.length);
          return {
            key: file.key,
            name: fileName,
            type: "file" as const,
            size: formatFileSize(file.size),
            sizeBytes: file.size,
            lastModified: formatDate(file.lastModified),
            icon: getFileIcon(fileName),
            fileType: getFileType(fileName),
          };
        });

        setItems([...folderItems, ...fileItems]);
        setHasMore(data.isTruncated);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
        setInitialLoad(false);
      }
    },
    [bucketId, userId, currentPath]
  );

  // Initial load and reload when path changes
  useEffect(() => {
    fetchBucketContents(currentPath);
  }, [currentPath, fetchBucketContents]);

  // Navigation functions
  const navigateToPath = (path: string) => {
    setCurrentPath(path);
    setSelectedItems([]);
    setSearchQuery("");
    setItems([]);
  };

  // File handling functions
  const handleItemClick = (item: S3Item) => {
    if (item.type === "folder") {
      navigateToPath(item.key);
    } else {
      handleFilePreview(item);
    }
  };

  const handleFilePreview = async (file: S3Item) => {
    const fileType = getFileType(file.name);
    
    setPreviewFile(file);
    setShowPreview(true);
    
    // For text-based files, fetch content
    if (fileType === "document" || fileType === "code") {
      setLoadingContent(true);
      try {
        const response = await fetch(getFilePreviewUrl(file));
        if (response.ok) {
          const content = await response.text();
          setTextContent(content);
        } else {
          setTextContent("Failed to load file content");
        }
      } catch (error) {
        console.error("Error loading text content:", error);
        setTextContent("Error loading file content");
      } finally {
        setLoadingContent(false);
      }
    } else {
      setTextContent("");
    }
  };

  const handleFileDownload = async (file: S3Item, openInNewTab: boolean = false) => {
    try {
      const downloadUrl = `/api/aws/get-file-content?userId=${encodeURIComponent(
        userId
      )}&bucketName=${encodeURIComponent(bucketId)}&key=${encodeURIComponent(
        file.key
      )}&type=download`;
      
      if (openInNewTab) {
        window.open(downloadUrl, '_blank');
      } else {
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error("Failed to download file");
    }
  };

  const getFilePreviewUrl = (file: S3Item) => {
    return `/api/aws/get-file-content?userId=${encodeURIComponent(
      userId
    )}&bucketName=${encodeURIComponent(bucketId)}&key=${encodeURIComponent(
      file.key
    )}&type=preview`;
  };

  const handleItemSelect = (key: string) => {
    setSelectedItems((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  // Upload functions
  const handleUploadClick = () => {
    setShowUploadModal(true);
  };

  const handleCloseUploadModal = () => {
    setShowUploadModal(false);
    setSelectedFiles(null);
    setFolderName("");
    setUploadTab("files");
    setIsUploading(false);
    setIsDragging(false);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(event.target.files);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const files = event.dataTransfer.files;
    setSelectedFiles(files);
  };

  const handleCreateFolder = async () => {
    if (!folderName.trim()) {
      toast.error("Please enter a folder name");
      return;
    }

    setIsUploading(true);
    try {
      const folderPath = currentPath + folderName.trim() + "/";
      
      const response = await fetch('/api/aws/create-folder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          bucketName: bucketId,
          folderPath: folderPath,
        }),
      });

      if (response.ok) {
        toast.success(`Folder "${folderName}" created successfully!`);
        await fetchBucketContents();
        handleCloseUploadModal();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to create folder");
      }
    } catch (error) {
      console.error("Error creating folder:", error);
      toast.error("Failed to create folder");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      toast.error("Please select files to upload");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('userId', userId);
      formData.append('bucketName', bucketId);
      formData.append('currentPath', currentPath);
      
      Array.from(selectedFiles).forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch('/api/aws/upload-files', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
        await fetchBucketContents();
        handleCloseUploadModal();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to upload files");
      }
    } catch (error) {
      console.error("Error uploading files:", error);
      toast.error("Failed to upload files");
    } finally {
      setIsUploading(false);
    }
  };

  // Delete functions
  const handleDeleteClick = (item: S3Item) => {
    setDeleteItem(item);
    setDeleteType(item.type === "folder" ? "folder" : "file");
    setShowDeleteModal(true);
  };

  const handleDeleteBucket = () => {
    setDeleteItem(null);
    setDeleteType("bucket");
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteItem(null);
    setIsDeleting(false);
  };

  const handleConfirmDelete = async () => {
    if (!deleteItem && deleteType !== "bucket") return;

    setIsDeleting(true);
    try {
      let response;
      
      if (deleteType === "bucket") {
        response = await fetch('/api/aws/delete-bucket', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            bucketName: bucketId,
            force: true, // Force delete non-empty buckets
          }),
        });
      } else if (deleteType === "folder" && deleteItem) {
        response = await fetch('/api/aws/delete-folder', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            bucketName: bucketId,
            folderPath: currentPath + deleteItem.name + "/",
          }),
        });
      } else if (deleteType === "file" && deleteItem) {
        response = await fetch('/api/aws/delete-file', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            bucketName: bucketId,
            fileKey: currentPath + deleteItem.name,
          }),
        });
      }

      if (response && response.ok) {
        const data = await response.json();
        toast.success(data.message);
        
        if (deleteType === "bucket") {
          // Redirect to buckets page after successful bucket deletion
          window.location.href = "/buckets";
        } else {
          // Refresh bucket contents
          await fetchBucketContents();
        }
        
        handleCloseDeleteModal();
      } else {
        const errorData = response ? await response.json() : { error: "Unknown error" };
        toast.error(errorData.error || `Failed to delete ${deleteType}`);
      }
    } catch (error) {
      console.error(`Error deleting ${deleteType}:`, error);
      toast.error(`Failed to delete ${deleteType}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Show error state only on initial load failure
  if (error && initialLoad) {
    return <ErrorState error={error} onRetry={() => fetchBucketContents()} />;
  }

  return (
    <div className="py-6 px-4 md:px-6 w-full max-w-7xl mx-auto font-mono">
      <BucketHeader
        bucketId={bucketId}
        breadcrumbs={breadcrumbs}
        onNavigateToPath={navigateToPath}
        onUploadClick={handleUploadClick}
        onDeleteBucket={handleDeleteBucket}
      />

      <BucketControls
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        filterBy={filterBy}
        onFilterChange={setFilterBy}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSortChange={setSortBy}
        onSortDirectionChange={setSortDirection}
        onRefresh={() => fetchBucketContents()}
        loading={loading}
        foldersCount={folders.length}
        filesCount={files.length}
        hasMore={hasMore}
        currentPath={currentPath}
        breadcrumbs={breadcrumbs}
      />

      {/* Content area with conditional loading */}
      {loading && items.length === 0 ? (
        <LoadingState />
      ) : (
        <>
          {/* Content display */}
          {viewMode === "grid" ? (
            <FileGrid
              folders={folders}
              files={files}
              selectedItems={selectedItems}
              onItemClick={handleItemClick}
              onItemSelect={handleItemSelect}
              onDeleteItem={handleDeleteClick}
            />
          ) : (
            <FileList
              items={sortedItems}
              selectedItems={selectedItems}
              onItemClick={handleItemClick}
              onFilePreview={handleFilePreview}
              onFileDownload={handleFileDownload}
              onDeleteItem={handleDeleteClick}
            />
          )}

          {/* Empty state */}
          {sortedItems.length === 0 && !loading && (
            <EmptyState
              loading={loading}
              searchQuery={searchQuery}
              onUploadClick={handleUploadClick}
            />
          )}

          {/* Loading more indicator */}
          {loading && items.length > 0 && <LoadingMoreState />}
        </>
      )}

      {/* Upload Modal */}
      <UploadModal
        isOpen={showUploadModal}
        onClose={handleCloseUploadModal}
        bucketId={bucketId}
        currentPath={currentPath}
        uploadTab={uploadTab}
        onUploadTabChange={setUploadTab}
        selectedFiles={selectedFiles}
        onFileSelect={handleFileSelect}
        folderName={folderName}
        onFolderNameChange={setFolderName}
        isUploading={isUploading}
        isDragging={isDragging}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onFileUpload={handleFileUpload}
        onCreateFolder={handleCreateFolder}
      />

      {/* File Preview Modal */}
      <FilePreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        file={previewFile}
        textContent={textContent}
        loadingContent={loadingContent}
        onDownload={handleFileDownload}
        getFilePreviewUrl={getFilePreviewUrl}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
        item={deleteItem}
        deleteType={deleteType}
        bucketName={bucketId}
      />
    </div>
  );
}
