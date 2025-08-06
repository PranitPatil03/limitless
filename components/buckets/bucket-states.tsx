import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "../ui/spinner";
import { AlertCircle, RefreshCw, Folder, Upload, Loader2 } from "lucide-react";

interface EmptyStateProps {
  loading: boolean;
  searchQuery: string;
  onUploadClick: () => void;
}

interface LoadingStateProps {
  message?: string;
}

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

export function EmptyState({ loading, searchQuery, onUploadClick }: EmptyStateProps) {
  if (loading) return null;
  
  return (
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
      <Button className="font-mono" onClick={onUploadClick}>
        <Upload className="w-4 h-4 mr-2" />
        Upload Files
      </Button>
    </Card>
  );
}

export function LoadingState({ message = "Loading bucket contents..." }: LoadingStateProps) {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner className="h-8 w-8" />
        <p className="text-muted-foreground font-mono">{message}</p>
      </div>
    </div>
  );
}

export function LoadingMoreState() {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="font-mono">Refreshing...</span>
      </div>
    </div>
  );
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
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
              <Button onClick={onRetry} className="font-mono">
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
