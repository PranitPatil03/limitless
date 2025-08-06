import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Eye,
  Download,
  MoreHorizontal,
  ExternalLink,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { S3Item } from "./types";

interface FileListProps {
  items: S3Item[];
  selectedItems: string[];
  onItemClick: (item: S3Item) => void;
  onFilePreview: (file: S3Item) => void;
  onFileDownload: (file: S3Item, openInNewTab?: boolean) => void;
}

export function FileList({
  items,
  selectedItems,
  onItemClick,
  onFilePreview,
  onFileDownload,
}: FileListProps) {
  return (
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
            {items.map((item) => (
              <tr
                key={item.key}
                className={`border-t hover:bg-muted/50 cursor-pointer ${
                  selectedItems.includes(item.key) ? "bg-primary/5" : ""
                }`}
                onClick={() => onItemClick(item)}
              >
                <td className="p-4">
                  <div className="flex items-center gap-3">
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
                    <div>
                      <span className="font-medium font-mono">
                        {item.name}
                      </span>
                      {item.type === "folder" && (
                        <Badge
                          variant="secondary"
                          className="text-xs font-mono ml-2"
                        >
                          Folder
                        </Badge>
                      )}
                      {item.fileType && item.fileType !== "document" && item.type === "file" && (
                        <Badge
                          variant="outline"
                          className="text-xs font-mono ml-2 capitalize"
                        >
                          {item.fileType}
                        </Badge>
                      )}
                    </div>
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
                      onClick={(e) => {
                        e.stopPropagation();
                        if (item.type === "file") {
                          onFilePreview(item);
                        }
                      }}
                      disabled={item.type === "folder"}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (item.type === "file") {
                          onFileDownload(item);
                        }
                      }}
                      disabled={item.type === "folder"}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="font-mono">
                        {item.type === "file" && (
                          <>
                            <DropdownMenuItem onClick={() => onFilePreview(item)}>
                              <Eye className="w-4 h-4 mr-2" />
                              Preview
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onFileDownload(item)}>
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onFileDownload(item, true)}>
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Open in New Tab
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                          </>
                        )}
                        <DropdownMenuItem
                          onClick={() => {
                            navigator.clipboard.writeText(item.key);
                            toast.success("Path copied to clipboard");
                          }}
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Copy Path
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
