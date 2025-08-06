import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "../ui/spinner";
import { AlertTriangle, Trash2, Folder, File } from "lucide-react";
import { S3Item } from "./types";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
  item: S3Item | null;
  deleteType: "file" | "folder" | "bucket";
  bucketName?: string;
}

export function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
  item,
  deleteType,
  bucketName,
}: DeleteConfirmationModalProps) {
  const getTitle = () => {
    switch (deleteType) {
      case "file":
        return "Delete File";
      case "folder":
        return "Delete Folder";
      case "bucket":
        return "Delete Bucket";
      default:
        return "Delete Item";
    }
  };

  const getDescription = () => {
    switch (deleteType) {
      case "file":
        return `Are you sure you want to delete "${item?.name}"? This action cannot be undone.`;
      case "folder":
        return `Are you sure you want to delete the folder "${item?.name}" and all its contents? This action cannot be undone.`;
      case "bucket":
        return `Are you sure you want to delete the entire bucket "${bucketName}" and all its contents? This action cannot be undone.`;
      default:
        return "This action cannot be undone.";
    }
  };

  const getIcon = () => {
    switch (deleteType) {
      case "file":
        return <File className="w-5 h-5 text-red-600" />;
      case "folder":
        return <Folder className="w-5 h-5 text-red-600" />;
      case "bucket":
        return <Trash2 className="w-5 h-5 text-red-600" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
    }
  };

  const getButtonText = () => {
    if (isDeleting) {
      switch (deleteType) {
        case "file":
          return "Deleting File...";
        case "folder":
          return "Deleting Folder...";
        case "bucket":
          return "Deleting Bucket...";
        default:
          return "Deleting...";
      }
    }
    
    switch (deleteType) {
      case "file":
        return "Delete File";
      case "folder":
        return "Delete Folder";
      case "bucket":
        return "Delete Bucket";
      default:
        return "Delete";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              {getIcon()}
            </div>
            <div>
              <DialogTitle className="text-xl font-mono">{getTitle()}</DialogTitle>
              <DialogDescription className="font-mono">
                {getDescription()}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {item && (
          <div className="py-4">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
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
              <div className="flex-1">
                <p className="font-medium font-mono">{item.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs font-mono capitalize">
                    {item.type}
                  </Badge>
                  {item.size && (
                    <Badge variant="secondary" className="text-xs font-mono">
                      {item.size}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {deleteType === "bucket" && (
          <div className="py-2">
            <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 font-mono">
                  Warning: This will delete the entire bucket
                </p>
                <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1 font-mono">
                  All files, folders, and configurations will be permanently removed.
                </p>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="flex gap-2 pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={onClose} 
            disabled={isDeleting}
            className="font-mono"
          >
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={onConfirm} 
            disabled={isDeleting}
            className="font-mono"
          >
            {isDeleting ? (
              <>
                <LoadingSpinner className="w-4 h-4 mr-2" />
                {getButtonText()}
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                {getButtonText()}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
