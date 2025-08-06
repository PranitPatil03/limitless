// Types and interfaces for bucket components
import { LucideIcon } from "lucide-react";

export interface S3Item {
  key: string;
  name: string;
  type: "file" | "folder";
  size?: string;
  sizeBytes?: number;
  lastModified?: string;
  icon: LucideIcon;
  fileType?: string;
}

export interface BucketContentsResponse {
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

export interface BucketDetailProps {
  bucketId: string;
  userId: string;
}

export interface DeleteFileResponse {
  message: string;
  deletedKey: string;
}

export interface DeleteFolderResponse {
  message: string;
  deletedFolder: string;
  objectsDeleted: number;
  deletedObjects: string[];
}

export interface DeleteBucketResponse {
  message: string;
  deletedBucket: string;
  objectsDeleted?: boolean;
}

export type SortOption = "name" | "size" | "modified" | "type";
export type SortDirection = "asc" | "desc";
export type FilterOption =
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
export type ViewMode = "grid" | "list";
