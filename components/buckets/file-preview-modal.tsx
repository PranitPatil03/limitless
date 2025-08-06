import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LoadingSpinner } from "../ui/spinner";
import { Download, AlertCircle, Music } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { S3Item } from "./types";

interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: S3Item | null;
  textContent: string;
  loadingContent: boolean;
  onDownload: (file: S3Item, openInNewTab?: boolean) => void;
  getFilePreviewUrl: (file: S3Item) => string;
}

export function FilePreviewModal({
  isOpen,
  onClose,
  file,
  textContent,
  loadingContent,
  onDownload,
  getFilePreviewUrl,
}: FilePreviewModalProps) {
  if (!file) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                file.fileType === "image" ? "bg-green-100 dark:bg-green-900/20" :
                file.fileType === "video" ? "bg-purple-100 dark:bg-purple-900/20" :
                file.fileType === "pdf" ? "bg-red-100 dark:bg-red-900/20" :
                "bg-gray-100 dark:bg-gray-800"
              }`}>
                <file.icon className={`w-5 h-5 ${
                  file.fileType === "image" ? "text-green-600" :
                  file.fileType === "video" ? "text-purple-600" :
                  file.fileType === "pdf" ? "text-red-600" :
                  "text-gray-600"
                }`} />
              </div>
              <div>
                <DialogTitle className="text-xl font-mono">{file.name}</DialogTitle>
                <DialogDescription className="font-mono">
                  {file.size} • {file.fileType}
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDownload(file)}
                className="font-mono"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          <div className="space-y-4">
            {file.fileType === "image" && (
              <div className="flex justify-center">
                <div className="relative">
                  <Image
                    src={getFilePreviewUrl(file)}
                    alt={file.name}
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
                        onClick={() => onDownload(file)}
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

            {file.fileType === "video" && (
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
                    <source src={getFilePreviewUrl(file)} />
                    Your browser does not support the video tag.
                  </video>
                  <div className="error-fallback hidden text-center py-12">
                    <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground font-mono mb-4">Unable to preview this video</p>
                    <div className="flex justify-center gap-3">
                      <Button
                        onClick={() => onDownload(file)}
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

            {file.fileType === "audio" && (
              <div className="flex justify-center py-12">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 mx-auto bg-pink-100 dark:bg-pink-900/20 rounded-full flex items-center justify-center">
                    <Music className="w-10 h-10 text-pink-600" />
                  </div>
                  <div className="space-y-2">
                    <p className="font-medium font-mono">{file.name}</p>
                    <audio 
                      controls 
                      className="mx-auto"
                      onError={() => {
                        toast.error("Unable to play this audio file");
                      }}
                    >
                      <source src={getFilePreviewUrl(file)} />
                      Your browser does not support the audio tag.
                    </audio>
                  </div>
                </div>
              </div>
            )}

            {["document", "code"].includes(file.fileType || "") && (
              <div className="space-y-4">
                <div className="text-center py-4">
                  <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${
                    file.fileType === "code" ? "bg-yellow-100 dark:bg-yellow-900/20" :
                    "bg-blue-100 dark:bg-blue-900/20"
                  }`}>
                    <file.icon className={`w-8 h-8 ${
                      file.fileType === "code" ? "text-yellow-600" : "text-blue-600"
                    }`} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 font-mono">{file.name}</h3>
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
              </div>
            )}

            {file.fileType === "pdf" && (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                  <file.icon className="w-10 h-10 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2 font-mono">PDF Document</h3>
                <p className="text-muted-foreground mb-6 font-mono">
                  PDF files will open in a new tab for viewing.
                </p>
                <div className="flex justify-center gap-3">
                  <Button
                    onClick={() => onDownload(file, true)}
                    className="font-mono"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Open PDF
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => onDownload(file)}
                    className="font-mono"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            )}

            {!["image", "video", "audio", "document", "code", "pdf"].includes(file.fileType || "") && (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
                  <file.icon className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2 font-mono">Preview not available</h3>
                <p className="text-muted-foreground mb-6 font-mono">
                  This file type cannot be previewed in the browser.
                </p>
                <div className="flex justify-center gap-3">
                  <Button
                    onClick={() => onDownload(file)}
                    className="font-mono"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download File
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => onDownload(file, true)}
                    className="font-mono"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Open in New Tab
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
