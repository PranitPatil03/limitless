"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import {
  Folder,
  FileText,
  Image as ImageIcon,
  Video,
  Archive,
  Download,
  Upload,
  Search,
  ArrowLeft,
  MoreHorizontal,
  Grid3X3,
  List,
  SortAsc,
  SortDesc,
  Filter,
  Eye,
  Calendar,
  FileType,
  HardDrive,
  Loader2,
  RefreshCw,
  AlertCircle,
  FileCode,
  Music,
  FileSpreadsheet,
  Presentation,
  Book,
  ExternalLink,
} from "lucide-react";
import { LoadingSpinner } from "../ui/spinner";

interface BucketDetailProps {
  bucketId: string;
  userId: string;
}

interface S3Item {
  key: string;
  name: string;
  type: "folder" | "file";
  size?: string;
  lastModified?: string;
  icon: React.ComponentType<{ className?: string }>;
  isSelected?: boolean;
  fileType?: string;
  sizeBytes?: number;
}

interface BucketContentsResponse {
  folders: string[];
  files: Array<{
    key: string;
    size: number;
    lastModified: string;
    storageClass: string;
  }>;
  isTruncated: boolean;
  nextContinuationToken?: string;
}

type SortOption = "name" | "size" | "modified" | "type";
type SortDirection = "asc" | "desc";
type FilterOption =
  | "all"
  | "folders"
  | "files"
  | "pdf"
  | "image"
  | "video"
  | "audio"
  | "archive"
  | "document"
  | "code";

// Helper function to get file icon based on extension
const getFileIcon = (
  fileName: string
): React.ComponentType<{ className?: string }> => {
  const extension = fileName.split(".").pop()?.toLowerCase();

  switch (extension) {
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "bmp":
    case "svg":
    case "webp":
    case "ico":
      return ImageIcon;
    case "mp4":
    case "avi":
    case "mov":
    case "wmv":
    case "flv":
    case "webm":
    case "mkv":
    case "m4v":
      return Video;
    case "mp3":
    case "wav":
    case "flac":
    case "aac":
    case "ogg":
    case "m4a":
      return Music;
    case "zip":
    case "rar":
    case "7z":
    case "tar":
    case "gz":
    case "bz2":
      return Archive;
    case "pdf":
      return Book;
    case "doc":
    case "docx":
    case "txt":
    case "rtf":
      return FileText;
    case "xls":
    case "xlsx":
    case "csv":
      return FileSpreadsheet;
    case "ppt":
    case "pptx":
      return Presentation;
    case "js":
    case "ts":
    case "jsx":
    case "tsx":
    case "html":
    case "css":
    case "json":
    case "xml":
    case "py":
    case "java":
    case "cpp":
    case "c":
    case "php":
    case "rb":
    case "go":
    case "rs":
    case "sh":
    case "sql":
      return FileCode;
    default:
      return FileText;
  }
};

// Helper function to get file type category
const getFileType = (fileName: string): string => {
  const extension = fileName.split(".").pop()?.toLowerCase();

  if (
    ["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp", "ico"].includes(
      extension || ""
    )
  )
    return "image";
  if (["mp4", "avi", "mov", "wmv", "flv", "webm", "mkv", "m4v"].includes(extension || ""))
    return "video";
  if (["mp3", "wav", "flac", "aac", "ogg", "m4a"].includes(extension || ""))
    return "audio";
  if (["zip", "rar", "7z", "tar", "gz", "bz2"].includes(extension || ""))
    return "archive";
  if (["pdf"].includes(extension || "")) return "pdf";
  if (["doc", "docx", "txt", "rtf", "md", "log", "csv"].includes(extension || "")) return "document";
  if (["xls", "xlsx"].includes(extension || "")) return "spreadsheet";
  if (["ppt", "pptx"].includes(extension || "")) return "presentation";
  if (["js", "ts", "jsx", "tsx", "html", "css", "json", "xml", "py", "java", "cpp", "c", "php", "rb", "go", "rs", "sh", "sql", "yml", "yaml", "toml", "ini", "conf", "cfg"].includes(extension || "")) return "code";
  return "document";
};

// Helper function to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

// Helper function to format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
  return `${Math.ceil(diffDays / 365)} years ago`;
};

export default function BucketDetail({ bucketId, userId }: BucketDetailProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPath, setCurrentPath] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [filterBy, setFilterBy] = useState<FilterOption>("all");
  const [items, setItems] = useState<S3Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  
  // File preview state
  const [previewFile, setPreviewFile] = useState<S3Item | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [textContent, setTextContent] = useState<string>("");
  const [loadingContent, setLoadingContent] = useState(false);
  
  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTab, setUploadTab] = useState<"files" | "folder">("files");
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [folderName, setFolderName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

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

  // Filter and sort items
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

  const breadcrumbs = currentPath.split("/").filter(Boolean);

  const navigateToPath = (path: string) => {
    setCurrentPath(path);
    setSelectedItems([]);
    setSearchQuery("");
    setItems([]); // Clear current items while loading
  };

  const handleItemClick = (item: S3Item) => {
    if (item.type === "folder") {
      navigateToPath(item.key);
    } else {
      // Handle file preview based on file type
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

  const getSortIcon = () => {
    return sortDirection === "asc" ? (
      <SortAsc className="w-4 h-4" />
    ) : (
      <SortDesc className="w-4 h-4" />
    );
  };

  const getFilterLabel = () => {
    switch (filterBy) {
      case "folders":
        return "Folders";
      case "files":
        return "Files";
      case "pdf":
        return "PDFs";
      case "image":
        return "Images";
      case "video":
        return "Videos";
      case "audio":
        return "Audio";
      case "archive":
        return "Archives";
      case "document":
        return "Documents";
      case "code":
        return "Code";
      default:
        return "All";
    }
  };

  // Show error state only on initial load failure
  if (error && initialLoad) {
    return (
      <div className="py-6 px-4 md:px-6 w-full max-w-7xl mx-auto font-mono">
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="p-8 text-center max-w-md">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2 font-mono">
                  Error Loading Bucket
                </h3>
                <p className="text-muted-foreground mb-4 font-mono">{error}</p>
                <Button
                  onClick={() => fetchBucketContents()}
                  className="font-mono"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 px-4 md:px-6 w-full max-w-7xl mx-auto font-mono">
      {/* Header with breadcrumbs */}
      <div className="flex flex-col gap-2 mb-6">
        {/* Back link */}
        <div className="flex items-center gap-4">
          <Link
            href="/buckets"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-mono"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Buckets
          </Link>
        </div>
        {/* Breadcrumbs and Upload button */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground overflow-hidden font-mono">
            <span
              className="hover:text-foreground cursor-pointer font-semibold underline underline-offset-4"
              onClick={() => navigateToPath("")}
            >
              {bucketId}
            </span>
            {breadcrumbs.map((crumb, index) => (
              <div key={index} className="flex items-center gap-2">
                <span>›</span>
                <span
                  className="hover:text-foreground cursor-pointer truncate"
                  onClick={() =>
                    navigateToPath(
                      breadcrumbs.slice(0, index + 1).join("/") + "/"
                    )
                  }
                >
                  {crumb}
                </span>
              </div>
            ))}
          </div>
          <Button size="sm" className="h-10 px-4 font-mono" onClick={handleUploadClick}>
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </Button>
        </div>
      </div>

      {/* Title and controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 mt-2">
          <h1 className="text-3xl font-bold font-mono">
            {currentPath ? breadcrumbs[breadcrumbs.length - 1] : "root"}
          </h1>
          {!loading && (
            <Badge variant="secondary" className="font-mono">
              {folders.length} folders, {files.length} files
            </Badge>
          )}
          {hasMore && (
            <Badge variant="outline" className="font-mono">
              More items available
            </Badge>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search files and folders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full sm:w-64 h-10 font-mono"
            />
          </div>

          {/* View mode toggle */}
          <div className="flex items-center gap-1 border rounded-lg p-1 h-10">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="h-8 w-8 p-0"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="h-8 w-8 p-0"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>

          {/* Filter dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-10 px-3 font-mono"
              >
                <Filter className="w-4 h-4 mr-2" />
                {getFilterLabel()}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 font-mono">
              <DropdownMenuLabel>Filter by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setFilterBy("all")}>
                <HardDrive className="w-4 h-4 mr-2" />
                All Items
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterBy("folders")}>
                <Folder className="w-4 h-4 mr-2" />
                Folders Only
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterBy("files")}>
                <FileText className="w-4 h-4 mr-2" />
                Files Only
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setFilterBy("pdf")}>
                <Book className="w-4 h-4 mr-2" />
                PDF Documents
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterBy("image")}>
                <ImageIcon className="w-4 h-4 mr-2" />
                Images
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterBy("video")}>
                <Video className="w-4 h-4 mr-2" />
                Videos
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterBy("audio")}>
                <Music className="w-4 h-4 mr-2" />
                Audio Files
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterBy("archive")}>
                <Archive className="w-4 h-4 mr-2" />
                Archives
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterBy("document")}>
                <FileText className="w-4 h-4 mr-2" />
                Documents
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterBy("code")}>
                <FileCode className="w-4 h-4 mr-2" />
                Code Files
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sort dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-10 px-3 font-mono"
              >
                {getSortIcon()}
                <span className="ml-2 capitalize">{sortBy}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 font-mono">
              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSortBy("name")}>
                <FileType className="w-4 h-4 mr-2" />
                Name
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("size")}>
                <HardDrive className="w-4 h-4 mr-2" />
                Size
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("modified")}>
                <Calendar className="w-4 h-4 mr-2" />
                Last Modified
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("type")}>
                <FileType className="w-4 h-4 mr-2" />
                File Type
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  setSortDirection(sortDirection === "asc" ? "desc" : "asc")
                }
              >
                {sortDirection === "asc" ? (
                  <SortDesc className="w-4 h-4 mr-2" />
                ) : (
                  <SortAsc className="w-4 h-4 mr-2" />
                )}
                {sortDirection === "asc" ? "Descending" : "Ascending"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Refresh button */}
          <Button
            onClick={() => fetchBucketContents()}
            variant="outline"
            size="sm"
            className="h-10 px-3 font-mono"
            disabled={loading}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Content area with conditional loading */}
      {loading && items.length === 0 ? (
        // Show loading spinner in content area when initially loading
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <LoadingSpinner className="h-8 w-8" />
            <p className="text-muted-foreground font-mono">Loading bucket contents...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Content display */}
          {viewMode === "grid" ? (
            <div className="space-y-8">
              {folders.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold mb-4 font-mono">Folders</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {folders.map((folder) => (
                      <Card
                        key={folder.key}
                        className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105 ${
                          selectedItems.includes(folder.key)
                            ? "ring-2 ring-primary"
                            : ""
                        }`}
                        onClick={() => handleItemClick(folder)}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          handleItemSelect(folder.key);
                        }}
                      >
                        <div className="flex flex-col items-center text-center gap-3">
                          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                            <folder.icon className="w-6 h-6 text-blue-600" />
                          </div>
                          <div className="w-full">
                            <p className="font-medium text-sm truncate font-mono">
                              {folder.name}
                            </p>
                            <p className="text-xs text-muted-foreground font-mono">
                              Folder
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {files.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold mb-4 font-mono">Files</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {files.map((file) => (
                      <Card
                        key={file.key}
                        className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105 ${
                          selectedItems.includes(file.key)
                            ? "ring-2 ring-primary"
                            : ""
                        }`}
                        onClick={() => handleItemClick(file)}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          handleItemSelect(file.key);
                        }}
                      >
                        <div className="flex flex-col items-center text-center gap-3">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            file.fileType === "image" ? "bg-green-100 dark:bg-green-900/20" :
                            file.fileType === "video" ? "bg-purple-100 dark:bg-purple-900/20" :
                            file.fileType === "audio" ? "bg-pink-100 dark:bg-pink-900/20" :
                            file.fileType === "pdf" ? "bg-red-100 dark:bg-red-900/20" :
                            file.fileType === "code" ? "bg-yellow-100 dark:bg-yellow-900/20" :
                            file.fileType === "archive" ? "bg-orange-100 dark:bg-orange-900/20" :
                            "bg-gray-100 dark:bg-gray-800"
                          }`}>
                            <file.icon className={`w-6 h-6 ${
                              file.fileType === "image" ? "text-green-600" :
                              file.fileType === "video" ? "text-purple-600" :
                              file.fileType === "audio" ? "text-pink-600" :
                              file.fileType === "pdf" ? "text-red-600" :
                              file.fileType === "code" ? "text-yellow-600" :
                              file.fileType === "archive" ? "text-orange-600" :
                              "text-gray-600"
                            }`} />
                          </div>
                          <div className="w-full">
                            <p className="font-medium text-sm truncate font-mono">
                              {file.name}
                            </p>
                            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground font-mono">
                              <span>{file.size}</span>
                              {file.fileType && file.fileType !== "document" && (
                                <>
                                  <span>•</span>
                                  <span className="capitalize">{file.fileType}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Card className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4 font-medium font-mono">Name</th>
                      <th className="text-left p-4 font-medium font-mono">Size</th>
                      <th className="text-left p-4 font-medium font-mono">
                        Last Modified
                      </th>
                      <th className="text-left p-4 font-medium font-mono">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedItems.map((item) => (
                      <tr
                        key={item.key}
                        className={`border-t hover:bg-muted/50 cursor-pointer ${
                          selectedItems.includes(item.key) ? "bg-primary/5" : ""
                        }`}
                        onClick={() => handleItemClick(item)}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              item.type === "folder" ? "bg-blue-100 dark:bg-blue-900/20" :
                              item.fileType === "image" ? "bg-green-100 dark:bg-green-900/20" :
                              item.fileType === "video" ? "bg-purple-100 dark:bg-purple-900/20" :
                              item.fileType === "audio" ? "bg-pink-100 dark:bg-pink-900/20" :
                              item.fileType === "pdf" ? "bg-red-100 dark:bg-red-900/20" :
                              item.fileType === "code" ? "bg-yellow-100 dark:bg-yellow-900/20" :
                              item.fileType === "archive" ? "bg-orange-100 dark:bg-orange-900/20" :
                              "bg-gray-100 dark:bg-gray-800"
                            }`}>
                              <item.icon className={`w-4 h-4 ${
                                item.type === "folder" ? "text-blue-600" :
                                item.fileType === "image" ? "text-green-600" :
                                item.fileType === "video" ? "text-purple-600" :
                                item.fileType === "audio" ? "text-pink-600" :
                                item.fileType === "pdf" ? "text-red-600" :
                                item.fileType === "code" ? "text-yellow-600" :
                                item.fileType === "archive" ? "text-orange-600" :
                                "text-gray-600"
                              }`} />
                            </div>
                            <div>
                              <span className="font-medium font-mono">
                                {item.name}
                              </span>
                              {item.type === "folder" && (
                                <Badge
                                  variant="secondary"
                                  className="text-xs font-mono ml-2"
                                >
                                  Folder
                                </Badge>
                              )}
                              {item.fileType && item.fileType !== "document" && item.type === "file" && (
                                <Badge
                                  variant="outline"
                                  className="text-xs font-mono ml-2 capitalize"
                                >
                                  {item.fileType}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-muted-foreground font-mono">
                          {item.size || "—"}
                        </td>
                        <td className="p-4 text-muted-foreground font-mono">
                          {item.lastModified || "—"}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (item.type === "file") {
                                  handleFilePreview(item);
                                }
                              }}
                              disabled={item.type === "folder"}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (item.type === "file") {
                                  handleFileDownload(item);
                                }
                              }}
                              disabled={item.type === "folder"}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="font-mono">
                                {item.type === "file" && (
                                  <>
                                    <DropdownMenuItem onClick={() => handleFilePreview(item)}>
                                      <Eye className="w-4 h-4 mr-2" />
                                      Preview
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleFileDownload(item)}>
                                      <Download className="w-4 h-4 mr-2" />
                                      Download
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleFileDownload(item, true)}>
                                      <ExternalLink className="w-4 h-4 mr-2" />
                                      Open in New Tab
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                  </>
                                )}
                                <DropdownMenuItem
                                  onClick={() => {
                                    navigator.clipboard.writeText(item.key);
                                    toast.success("Path copied to clipboard");
                                  }}
                                >
                                  <FileText className="w-4 h-4 mr-2" />
                                  Copy Path
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Empty state */}
          {sortedItems.length === 0 && !loading && (
            <Card className="p-12 text-center">
              <Folder className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2 font-mono">
                No files found
              </h3>
              <p className="text-muted-foreground mb-4 font-mono">
                {searchQuery
                  ? "Try adjusting your search terms"
                  : "This folder is empty"}
              </p>
              <Button className="font-mono" onClick={handleUploadClick}>
                <Upload className="w-4 h-4 mr-2" />
                Upload Files
              </Button>
            </Card>
          )}

          {/* Loading more indicator (when there are already items displayed) */}
          {loading && items.length > 0 && (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="font-mono">Refreshing...</span>
              </div>
            </div>
          )}
        </>
      )}

      {/* Upload Modal */}
      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-mono">Upload to {bucketId}</DialogTitle>
            <DialogDescription className="font-mono">
              {currentPath ? (
                <>Upload files or create folders in <span className="font-semibold">/{currentPath}</span></>
              ) : (
                "Upload files or create folders in the root directory"
              )}
            </DialogDescription>
          </DialogHeader>

          <Tabs value={uploadTab} onValueChange={(value) => setUploadTab(value as "files" | "folder")} className="w-full">
            <TabsList className="grid w-full grid-cols-2 font-mono">
              <TabsTrigger value="files" className="font-mono">Add Files</TabsTrigger>
              <TabsTrigger value="folder" className="font-mono">Create Folder</TabsTrigger>
            </TabsList>

            <TabsContent value="files" className="space-y-4 mt-6">
              <div className="space-y-4">
                <div 
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    isDragging 
                      ? 'border-primary bg-primary/5' 
                      : 'border-muted hover:border-primary/50'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <div className="space-y-2">
                    <p className="text-lg font-medium font-mono">Choose files to upload</p>
                    <p className="text-sm text-muted-foreground font-mono">
                      Drag and drop files here, or click to browse
                    </p>
                  </div>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="inline-block mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md cursor-pointer hover:bg-primary/90 transition-colors font-mono"
                  >
                    Browse Files
                  </label>
                </div>

                {selectedFiles && selectedFiles.length > 0 && (
                  <div className="space-y-2">
                    <p className="font-medium font-mono">Selected files:</p>
                    <div className="max-h-32 overflow-y-auto border rounded-md p-3 bg-muted/50">
                      {Array.from(selectedFiles).map((file, index) => (
                        <div key={index} className="flex items-center justify-between py-1">
                          <span className="text-sm font-mono truncate">{file.name}</span>
                          <span className="text-xs text-muted-foreground font-mono">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="folder" className="space-y-4 mt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="folder-name" className="block text-sm font-medium font-mono">
                    Folder Name
                  </label>
                  <Input
                    id="folder-name"
                    value={folderName}
                    onChange={(e) => setFolderName(e.target.value)}
                    placeholder="Enter folder name"
                    className="font-mono"
                    disabled={isUploading}
                  />
                  <p className="text-xs text-muted-foreground font-mono">
                    Folder will be created at: {currentPath ? `/${currentPath}${folderName}` : `/${folderName}`}
                  </p>
                </div>

                <div className="border rounded-lg p-4 bg-muted/50">
                  <div className="flex items-start gap-3">
                    <Folder className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium font-mono">Creating a Folder</h4>
                      <p className="text-sm text-muted-foreground font-mono mt-1">
                        In S3, folders are virtual. They&apos;re created when you add files to them. 
                        This will create an empty placeholder to establish the folder structure.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="flex gap-2 pt-6 border-t">
            <Button variant="outline" onClick={handleCloseUploadModal} disabled={isUploading} className="font-mono">
              Cancel
            </Button>
            {uploadTab === "files" ? (
              <Button 
                onClick={handleFileUpload} 
                disabled={!selectedFiles || selectedFiles.length === 0 || isUploading}
                className="font-mono"
              >
                {isUploading ? (
                  <>
                    <LoadingSpinner className="w-4 h-4 mr-2" />
                    Uploading...
                  </>
                ) : (
                  `Upload ${selectedFiles?.length || 0} file(s)`
                )}
              </Button>
            ) : (
              <Button 
                onClick={handleCreateFolder} 
                disabled={!folderName.trim() || isUploading}
                className="font-mono"
              >
                {isUploading ? (
                  <>
                    <LoadingSpinner className="w-4 h-4 mr-2" />
                    Creating...
                  </>
                ) : (
                  "Create Folder"
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* File Preview Modal */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  previewFile?.fileType === "image" ? "bg-green-100 dark:bg-green-900/20" :
                  previewFile?.fileType === "video" ? "bg-purple-100 dark:bg-purple-900/20" :
                  previewFile?.fileType === "pdf" ? "bg-red-100 dark:bg-red-900/20" :
                  "bg-gray-100 dark:bg-gray-800"
                }`}>
                  {previewFile && (
                    <previewFile.icon className={`w-5 h-5 ${
                      previewFile.fileType === "image" ? "text-green-600" :
                      previewFile.fileType === "video" ? "text-purple-600" :
                      previewFile.fileType === "pdf" ? "text-red-600" :
                      "text-gray-600"
                    }`} />
                  )}
                </div>
                <div>
                  <DialogTitle className="text-xl font-mono">{previewFile?.name}</DialogTitle>
                  <DialogDescription className="font-mono">
                    {previewFile?.size} • {previewFile?.fileType}
                  </DialogDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => previewFile && handleFileDownload(previewFile)}
                  className="font-mono"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                {/* <Button
                  variant="outline"
                  size="sm"
                  onClick={() => previewFile && handleFileDownload(previewFile, true)}
                  className="font-mono"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open
                </Button> */}
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-auto">
            {previewFile && (
              <div className="space-y-4">
                {previewFile.fileType === "image" && (
                  <div className="flex justify-center">
                    <div className="relative">
                      <Image
                        src={getFilePreviewUrl(previewFile)}
                        alt={previewFile.name}
                        width={800}
                        height={600}
                        className="max-w-full max-h-[60vh] object-contain rounded-lg border"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const errorDiv = e.currentTarget.parentElement?.querySelector('.error-fallback');
                          if (errorDiv) {
                            errorDiv.classList.remove('hidden');
                          }
                        }}
                        onLoad={(e) => {
                          const errorDiv = e.currentTarget.parentElement?.querySelector('.error-fallback');
                          if (errorDiv) {
                            errorDiv.classList.add('hidden');
                          }
                        }}
                      />
                      <div className="error-fallback hidden text-center py-12">
                        <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground font-mono mb-4">Unable to preview this image</p>
                        <div className="flex justify-center gap-3">
                          <Button
                            onClick={() => handleFileDownload(previewFile)}
                            variant="outline"
                            size="sm"
                            className="font-mono"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download Instead
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {previewFile.fileType === "video" && (
                  <div className="flex justify-center">
                    <div className="relative">
                      <video
                        controls
                        className="max-w-full max-h-[60vh] rounded-lg border"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const errorDiv = e.currentTarget.parentElement?.querySelector('.error-fallback');
                          if (errorDiv) {
                            errorDiv.classList.remove('hidden');
                          }
                        }}
                        onLoadedData={(e) => {
                          const errorDiv = e.currentTarget.parentElement?.querySelector('.error-fallback');
                          if (errorDiv) {
                            errorDiv.classList.add('hidden');
                          }
                        }}
                      >
                        <source src={getFilePreviewUrl(previewFile)} />
                        Your browser does not support the video tag.
                      </video>
                      <div className="error-fallback hidden text-center py-12">
                        <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground font-mono mb-4">Unable to preview this video</p>
                        <div className="flex justify-center gap-3">
                          <Button
                            onClick={() => handleFileDownload(previewFile)}
                            variant="outline"
                            size="sm"
                            className="font-mono"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download Instead
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {previewFile.fileType === "audio" && (
                  <div className="flex justify-center py-12">
                    <div className="text-center space-y-4">
                      <div className="w-20 h-20 mx-auto bg-pink-100 dark:bg-pink-900/20 rounded-full flex items-center justify-center">
                        <Music className="w-10 h-10 text-pink-600" />
                      </div>
                      <div className="space-y-2">
                        <p className="font-medium font-mono">{previewFile.name}</p>
                        <audio 
                          controls 
                          className="mx-auto"
                          onError={() => {
                            toast.error("Unable to play this audio file");
                          }}
                        >
                          <source src={getFilePreviewUrl(previewFile)} />
                          Your browser does not support the audio tag.
                        </audio>
                      </div>
                    </div>
                  </div>
                )}

                {["document", "code"].includes(previewFile.fileType || "") && (
                  <div className="space-y-4">
                    <div className="text-center py-4">
                      <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${
                        previewFile.fileType === "code" ? "bg-yellow-100 dark:bg-yellow-900/20" :
                        "bg-blue-100 dark:bg-blue-900/20"
                      }`}>
                        <previewFile.icon className={`w-8 h-8 ${
                          previewFile.fileType === "code" ? "text-yellow-600" : "text-blue-600"
                        }`} />
                      </div>
                      <h3 className="text-lg font-semibold mb-2 font-mono">{previewFile.name}</h3>
                    </div>
                    
                    {loadingContent ? (
                      <div className="flex items-center justify-center py-12">
                        <LoadingSpinner className="w-6 h-6 mr-2" />
                        <span className="font-mono">Loading content...</span>
                      </div>
                    ) : (
                      <Card className="p-4 bg-muted/30">
                        <h4 className="font-medium font-mono mb-3">File Content</h4>
                        <div className="max-h-96 overflow-auto">
                          <pre className="text-sm font-mono whitespace-pre-wrap break-words">
                            {textContent || "No content available"}
                          </pre>
                        </div>
                      </Card>
                    )}
                    
                    {/* <div className="flex justify-center gap-3">
                      <Button
                        onClick={() => handleFileDownload(previewFile)}
                        className="font-mono"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download File
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleFileDownload(previewFile, true)}
                        className="font-mono"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open in New Tab
                      </Button>
                    </div> */}
                  </div>
                )}

                {previewFile.fileType === "pdf" && (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 mx-auto bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                      <previewFile.icon className="w-10 h-10 text-red-600" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 font-mono">PDF Document</h3>
                    <p className="text-muted-foreground mb-6 font-mono">
                      PDF files will open in a new tab for viewing.
                    </p>
                    <div className="flex justify-center gap-3">
                      <Button
                        onClick={() => handleFileDownload(previewFile, true)}
                        className="font-mono"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open PDF
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleFileDownload(previewFile)}
                        className="font-mono"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                )}

                {!["image", "video", "audio", "document", "code", "pdf"].includes(previewFile.fileType || "") && (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
                      <previewFile.icon className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 font-mono">Preview not available</h3>
                    <p className="text-muted-foreground mb-6 font-mono">
                      This file type cannot be previewed in the browser.
                    </p>
                    <div className="flex justify-center gap-3">
                      <Button
                        onClick={() => handleFileDownload(previewFile)}
                        className="font-mono"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download File
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleFileDownload(previewFile, true)}
                        className="font-mono"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open in New Tab
                      </Button>
                    </div>
                  </div>
                )}

                {/* File metadata */}
                {/* <Card className="p-4 bg-muted/30">
                  <h4 className="font-medium font-mono mb-3">File Details</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground font-mono">Size</p>
                      <p className="font-mono">{previewFile.size}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground font-mono">Type</p>
                      <p className="font-mono capitalize">{previewFile.fileType}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground font-mono">Modified</p>
                      <p className="font-mono">{previewFile.lastModified || "Unknown"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground font-mono">Path</p>
                      <p className="font-mono text-xs truncate">{previewFile.key}</p>
                    </div>
                  </div>
                </Card> */}
              </div>
            )}
          </div>

          {/* <DialogFooter className="border-t pt-4">
            <Button
              variant="outline"
              onClick={() => setShowPreview(false)}
              className="font-mono"
            >
              <X className="w-4 h-4 mr-2" />
              Close
            </Button>
          </DialogFooter> */}
        </DialogContent>
      </Dialog>
    </div>
  );
}