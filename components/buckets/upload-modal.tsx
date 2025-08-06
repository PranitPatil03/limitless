import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingSpinner } from "../ui/spinner";
import { Upload, Folder } from "lucide-react";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  bucketId: string;
  currentPath: string;
  uploadTab: "files" | "folder";
  onUploadTabChange: (tab: "files" | "folder") => void;
  selectedFiles: FileList | null;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  folderName: string;
  onFolderNameChange: (name: string) => void;
  isUploading: boolean;
  isDragging: boolean;
  onDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (event: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (event: React.DragEvent<HTMLDivElement>) => void;
  onFileUpload: () => void;
  onCreateFolder: () => void;
}

export function UploadModal({
  isOpen,
  onClose,
  bucketId,
  currentPath,
  uploadTab,
  onUploadTabChange,
  selectedFiles,
  onFileSelect,
  folderName,
  onFolderNameChange,
  isUploading,
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileUpload,
  onCreateFolder,
}: UploadModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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

        <Tabs value={uploadTab} onValueChange={(value) => onUploadTabChange(value as "files" | "folder")} className="w-full">
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
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
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
                  onChange={onFileSelect}
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
                  onChange={(e) => onFolderNameChange(e.target.value)}
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
          <Button variant="outline" onClick={onClose} disabled={isUploading} className="font-mono">
            Cancel
          </Button>
          {uploadTab === "files" ? (
            <Button 
              onClick={onFileUpload} 
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
              onClick={onCreateFolder} 
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
  );
}
