import {
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  FileArchive,
  FileCode,
  Book,
  File,
} from "lucide-react";
import { LucideIcon } from "lucide-react";

// Helper function to format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// Helper function to format date
export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Invalid Date";
  }
};

// Helper function to get file type based on extension
export const getFileType = (fileName: string): string => {
  const ext = fileName.toLowerCase().split(".").pop() || "";

  // Image files
  if (["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp"].includes(ext)) {
    return "image";
  }

  // Video files
  if (["mp4", "avi", "mkv", "mov", "wmv", "flv", "webm"].includes(ext)) {
    return "video";
  }

  // Audio files
  if (["mp3", "wav", "flac", "aac", "ogg", "m4a"].includes(ext)) {
    return "audio";
  }

  // Archive files
  if (["zip", "rar", "7z", "tar", "gz", "bz2"].includes(ext)) {
    return "archive";
  }

  // Code files
  if (
    [
      "js",
      "ts",
      "jsx",
      "tsx",
      "py",
      "java",
      "cpp",
      "c",
      "h",
      "css",
      "html",
      "php",
      "rb",
      "go",
      "rs",
      "swift",
    ].includes(ext)
  ) {
    return "code";
  }

  // PDF files
  if (ext === "pdf") {
    return "pdf";
  }

  // Document files
  if (["doc", "docx", "txt", "rtf", "odt"].includes(ext)) {
    return "document";
  }

  return "document";
};

// Helper function to get file icon based on file type
export const getFileIcon = (fileName: string): LucideIcon => {
  const fileType = getFileType(fileName);

  switch (fileType) {
    case "image":
      return FileImage;
    case "video":
      return FileVideo;
    case "audio":
      return FileAudio;
    case "archive":
      return FileArchive;
    case "code":
      return FileCode;
    case "pdf":
      return Book;
    case "document":
      return FileText;
    default:
      return File;
  }
};
