import { Button } from "@/components/ui/button";
import { ArrowLeft, Upload } from "lucide-react";
import Link from "next/link";

interface BucketHeaderProps {
  bucketId: string;
  breadcrumbs: string[];
  onNavigateToPath: (path: string) => void;
  onUploadClick: () => void;
}

export function BucketHeader({
  bucketId,
  breadcrumbs,
  onNavigateToPath,
  onUploadClick,
}: BucketHeaderProps) {
  return (
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
            onClick={() => onNavigateToPath("")}
          >
            {bucketId}
          </span>
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center gap-2">
              <span>›</span>
              <span
                className="hover:text-foreground cursor-pointer truncate"
                onClick={() =>
                  onNavigateToPath(
                    breadcrumbs.slice(0, index + 1).join("/") + "/"
                  )
                }
              >
                {crumb}
              </span>
            </div>
          ))}
        </div>
        <Button size="sm" className="h-10 px-4 font-mono" onClick={onUploadClick}>
          <Upload className="w-4 h-4 mr-2" />
          Upload
        </Button>
      </div>
    </div>
  );
}
