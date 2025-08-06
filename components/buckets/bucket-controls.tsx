import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Grid3X3,
  List,
  Filter,
  RefreshCw,
  SortAsc,
  SortDesc,
  HardDrive,
  Folder,
  FileText,
  Book,
  ImageIcon,
  Video,
  Music,
  Archive,
  FileCode,
  FileType,
  Calendar,
} from "lucide-react";
import { SortOption, SortDirection, FilterOption, ViewMode } from "./types";

interface BucketControlsProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  filterBy: FilterOption;
  onFilterChange: (filter: FilterOption) => void;
  sortBy: SortOption;
  sortDirection: SortDirection;
  onSortChange: (sort: SortOption) => void;
  onSortDirectionChange: (direction: SortDirection) => void;
  onRefresh: () => void;
  loading: boolean;
  foldersCount: number;
  filesCount: number;
  hasMore: boolean;
  currentPath: string;
  breadcrumbs: string[];
}

export function BucketControls({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  filterBy,
  onFilterChange,
  sortBy,
  sortDirection,
  onSortChange,
  onSortDirectionChange,
  onRefresh,
  loading,
  foldersCount,
  filesCount,
  hasMore,
  currentPath,
  breadcrumbs,
}: BucketControlsProps) {
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

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
      <div className="flex items-center gap-3 mt-2">
        <h1 className="text-3xl font-bold font-mono">
          {currentPath ? breadcrumbs[breadcrumbs.length - 1] : "root"}
        </h1>
        {!loading && (
          <Badge variant="secondary" className="font-mono">
            {foldersCount} folders, {filesCount} files
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
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 w-full sm:w-64 h-10 font-mono"
          />
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 border rounded-lg p-1 h-10">
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("grid")}
            className="h-8 w-8 p-0"
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("list")}
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
            <DropdownMenuItem onClick={() => onFilterChange("all")}>
              <HardDrive className="w-4 h-4 mr-2" />
              All Items
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFilterChange("folders")}>
              <Folder className="w-4 h-4 mr-2" />
              Folders Only
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFilterChange("files")}>
              <FileText className="w-4 h-4 mr-2" />
              Files Only
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onFilterChange("pdf")}>
              <Book className="w-4 h-4 mr-2" />
              PDF Documents
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFilterChange("image")}>
              <ImageIcon className="w-4 h-4 mr-2" />
              Images
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFilterChange("video")}>
              <Video className="w-4 h-4 mr-2" />
              Videos
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFilterChange("audio")}>
              <Music className="w-4 h-4 mr-2" />
              Audio Files
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFilterChange("archive")}>
              <Archive className="w-4 h-4 mr-2" />
              Archives
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFilterChange("document")}>
              <FileText className="w-4 h-4 mr-2" />
              Documents
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFilterChange("code")}>
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
            <DropdownMenuItem onClick={() => onSortChange("name")}>
              <FileType className="w-4 h-4 mr-2" />
              Name
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSortChange("size")}>
              <HardDrive className="w-4 h-4 mr-2" />
              Size
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSortChange("modified")}>
              <Calendar className="w-4 h-4 mr-2" />
              Last Modified
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSortChange("type")}>
              <FileType className="w-4 h-4 mr-2" />
              File Type
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() =>
                onSortDirectionChange(sortDirection === "asc" ? "desc" : "asc")
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
          onClick={onRefresh}
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
  );
}
