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
import Link from "next/link";
import { useState } from "react";
import {
  Folder,
  FileText,
  Image as ImageIcon,
  Video,
  Archive,
  Download,
  Trash2,
  Upload,
  Plus,
  Search,
  ArrowLeft,
  MoreHorizontal,
  Grid3X3,
  List,
  SortAsc,
  SortDesc,
  Filter,
  Eye,
  Copy,
  Share,
  Star,
  Calendar,
  FileType,
  HardDrive,
} from "lucide-react";

interface BucketDetailProps {
  bucketId: string;
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
}

const mockS3Data: S3Item[] = [
  { key: "documents/", name: "Documents", type: "folder", icon: Folder },
  { key: "images/", name: "Images", type: "folder", icon: Folder },
  { key: "videos/", name: "Videos", type: "folder", icon: Folder },
  { key: "archives/", name: "Archives", type: "folder", icon: Folder },
  { key: "projects/", name: "Projects", type: "folder", icon: Folder },
  { key: "backups/", name: "Backups", type: "folder", icon: Folder },

  {
    key: "project-proposal.pdf",
    name: "project-proposal.pdf",
    type: "file",
    size: "2.4 MB",
    lastModified: "2 hours ago",
    icon: FileText,
    fileType: "pdf",
  },
  {
    key: "banner-image.jpg",
    name: "banner-image.jpg",
    type: "file",
    size: "1.8 MB",
    lastModified: "1 day ago",
    icon: ImageIcon,
    fileType: "image",
  },
  {
    key: "presentation.pptx",
    name: "presentation.pptx",
    type: "file",
    size: "5.2 MB",
    lastModified: "3 days ago",
    icon: FileText,
    fileType: "document",
  },
  {
    key: "demo-video.mp4",
    name: "demo-video.mp4",
    type: "file",
    size: "45.3 MB",
    lastModified: "1 week ago",
    icon: Video,
    fileType: "video",
  },
  {
    key: "data-export.zip",
    name: "data-export.zip",
    type: "file",
    size: "12.7 MB",
    lastModified: "2 weeks ago",
    icon: Archive,
    fileType: "archive",
  },
  {
    key: "readme.md",
    name: "readme.md",
    type: "file",
    size: "2.1 KB",
    lastModified: "1 month ago",
    icon: FileText,
    fileType: "text",
  },
];

type SortOption = "name" | "size" | "modified" | "type";
type SortDirection = "asc" | "desc";
type FilterOption =
  | "all"
  | "folders"
  | "files"
  | "pdf"
  | "image"
  | "video"
  | "archive"
  | "text";

export default function BucketDetail({ bucketId }: BucketDetailProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPath, setCurrentPath] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [filterBy, setFilterBy] = useState<FilterOption>("all");

  const filteredItems = mockS3Data.filter((item) => {
    const matchesPath = item.key.startsWith(currentPath);
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    let matchesFilter = true;
    if (filterBy === "folders") matchesFilter = item.type === "folder";
    else if (filterBy === "files") matchesFilter = item.type === "file";
    else if (filterBy !== "all") matchesFilter = item.fileType === filterBy;

    return matchesPath && matchesSearch && matchesFilter;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case "name":
        comparison = a.name.localeCompare(b.name);
        break;
      case "size":
        const sizeA = a.size ? parseFloat(a.size.split(" ")[0]) : 0;
        const sizeB = b.size ? parseFloat(b.size.split(" ")[0]) : 0;
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
  };

  const handleItemClick = (item: S3Item) => {
    if (item.type === "folder") {
      navigateToPath(item.key);
    } else {
      console.log("File clicked:", item.name);
    }
  };

  const handleItemSelect = (key: string) => {
    setSelectedItems((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
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
      case "archive":
        return "Archives";
      case "text":
        return "Text";
      default:
        return "All";
    }
  };

  return (
    <div className="py-6 px-4 md:px-6 w-full max-w-7xl mx-auto font-mono">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/buckets"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-mono"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Buckets
          </Link>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground overflow-hidden font-mono">
          <span
            className="hover:text-foreground cursor-pointer"
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
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold font-mono">
            {currentPath || "Root"}
          </h1>
          <Badge variant="secondary" className="font-mono">
            {folders.length} folders, {files.length} files
          </Badge>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search files and folders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full sm:w-64 h-10 font-mono"
            />
          </div>

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
                <FileText className="w-4 h-4 mr-2" />
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
              <DropdownMenuItem onClick={() => setFilterBy("archive")}>
                <Archive className="w-4 h-4 mr-2" />
                Archives
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterBy("text")}>
                <FileText className="w-4 h-4 mr-2" />
                Text Files
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

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

          <Button size="sm" className="h-10 px-4 font-mono">
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </Button>
        </div>
      </div>

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
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                        <file.icon className="w-6 h-6 text-gray-600" />
                      </div>
                      <div className="w-full">
                        <p className="font-medium text-sm truncate font-mono">
                          {file.name}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {file.size}
                        </p>
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
                {[...folders, ...files].map((item) => (
                  <tr
                    key={item.key}
                    className={`border-t hover:bg-muted/50 cursor-pointer ${
                      selectedItems.includes(item.key) ? "bg-primary/5" : ""
                    }`}
                    onClick={() => handleItemClick(item)}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <item.icon className="w-5 h-5 text-blue-500" />
                        <span className="font-medium font-mono">
                          {item.name}
                        </span>
                        {item.type === "folder" && (
                          <Badge
                            variant="secondary"
                            className="text-xs font-mono"
                          >
                            Folder
                          </Badge>
                        )}
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
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {filteredItems.length === 0 && (
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
          <Button className="font-mono">
            <Upload className="w-4 h-4 mr-2" />
            Upload Files
          </Button>
        </Card>
      )}
    </div>
  );
}
