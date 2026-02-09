import { Pencil, Trash2 } from "lucide-react";
import type { WorkspaceAnnotation } from "@/types/models";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AnnotationsListTabProps {
  annotations: WorkspaceAnnotation[];
  onAnnotationClick: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
}

export function AnnotationsListTab({
  annotations,
  onAnnotationClick,
  onEdit,
  onDelete,
  showActions = true,
}: AnnotationsListTabProps) {
  const sorted = [...annotations].sort(
    (a, b) => a.startOffset - b.startOffset,
  );

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1">
        <Table aria-label="Annotations list">
          <TableHeader>
            <TableRow>
              <TableHead className="w-24">Tag</TableHead>
              <TableHead className="w-32">Class</TableHead>
              <TableHead>Text</TableHead>
              <TableHead className="w-16 text-right">Start</TableHead>
              <TableHead className="w-16 text-right">End</TableHead>
              {showActions && <TableHead className="w-20">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={showActions ? 6 : 5}
                  className="text-center text-muted-foreground py-8"
                >
                  No annotations yet
                </TableCell>
              </TableRow>
            ) : (
              sorted.map((ann) => (
                <TableRow
                  key={ann.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onAnnotationClick(ann.id)}
                >
                  <TableCell className="font-mono text-xs">
                    {ann.tag}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <div
                        className="h-3 w-3 rounded shrink-0"
                        style={{ backgroundColor: ann.classColor }}
                      />
                      <span className="text-xs truncate">
                        {ann.classDisplayLabel}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell
                    className="font-mono text-xs truncate max-w-[150px]"
                    title={ann.originalText}
                  >
                    {ann.originalText}
                  </TableCell>
                  <TableCell className="text-right text-xs">
                    {ann.startOffset}
                  </TableCell>
                  <TableCell className="text-right text-xs">
                    {ann.endOffset}
                  </TableCell>
                  {showActions && (
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit?.(ann.id);
                          }}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete?.(ann.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}
