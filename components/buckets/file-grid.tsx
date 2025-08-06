import { Card } from "@/components/ui/card";
import { S3Item } from "./types";

interface FileGridProps {
  folders: S3Item[];
  files: S3Item[];
  selectedItems: string[];
  onItemClick: (item: S3Item) => void;
  onItemSelect: (key: string) => void;
}

export function FileGrid({
  folders,
  files,
  selectedItems,
  onItemClick,
  onItemSelect,
}: FileGridProps) {
  return (
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
                onClick={() => onItemClick(folder)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  onItemSelect(folder.key);
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
                onClick={() => onItemClick(file)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  onItemSelect(file.key);
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
  );
}
