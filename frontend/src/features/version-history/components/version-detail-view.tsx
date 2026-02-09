import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAnnotationsForVersion } from "../api/get-annotations-for-version";
import type { AnnotationVersionSummary } from "../api/history-mapper";

interface VersionDetailViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  version: AnnotationVersionSummary | null;
}

export function VersionDetailView({
  open,
  onOpenChange,
  version,
}: VersionDetailViewProps) {
  const { data: annotations, isLoading } = useAnnotationsForVersion(
    version?.id ?? null,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            Version {version?.versionNumber} Details
          </DialogTitle>
          {version && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="outline">{version.source}</Badge>
              <span>{version.createdBy?.name ?? "Unknown"}</span>
              <span>&middot;</span>
              <span>{new Date(version.createdAt).toLocaleString()}</span>
              <span>&middot;</span>
              <span>{version.annotationCount} annotations</span>
            </div>
          )}
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
              Loading annotations...
            </div>
          ) : !annotations || annotations.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
              No annotations in this version
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tag</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Original Text</TableHead>
                  <TableHead className="w-[80px]">Start</TableHead>
                  <TableHead className="w-[80px]">End</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {annotations.map((ann) => (
                  <TableRow key={ann.id}>
                    <TableCell className="text-sm font-medium">
                      {ann.tag}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <span
                          className="inline-block h-3 w-3 rounded-sm border"
                          style={{ backgroundColor: ann.classColor }}
                        />
                        <span className="text-sm">
                          {ann.classDisplayLabel}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm font-mono max-w-[250px] truncate">
                      {ann.originalText}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">
                      {ann.startOffset}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">
                      {ann.endOffset}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
