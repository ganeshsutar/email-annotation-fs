import { Eye, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExportControlsProps {
  selectedCount: number;
  totalCount: number;
  isExporting: boolean;
  onPreview: () => void;
  onExportSelected: () => void;
  onExportAll: () => void;
}

export function ExportControls({
  selectedCount,
  totalCount,
  isExporting,
  onPreview,
  onExportSelected,
  onExportAll,
}: ExportControlsProps) {
  return (
    <div className="flex items-center gap-3">
      <Button
        variant="outline"
        size="sm"
        disabled={selectedCount !== 1}
        onClick={onPreview}
      >
        <Eye className="h-4 w-4 mr-1.5" />
        Preview Selected
      </Button>
      <Button
        size="sm"
        disabled={selectedCount === 0 || isExporting}
        onClick={onExportSelected}
      >
        {isExporting ? (
          <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
        ) : (
          <Download className="h-4 w-4 mr-1.5" />
        )}
        Export Selected ({selectedCount})
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={totalCount === 0 || isExporting}
        onClick={onExportAll}
      >
        <Download className="h-4 w-4 mr-1.5" />
        Export All ({totalCount})
      </Button>
    </div>
  );
}
