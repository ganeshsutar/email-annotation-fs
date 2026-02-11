import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatFileSize } from "@/lib/utils";
import type { ExportRecord } from "../api/export-mapper";

interface ExportHistoryTableProps {
  exports: ExportRecord[];
}

export function ExportHistoryTable({ exports }: ExportHistoryTableProps) {
  return (
    <div className="border rounded-lg" data-testid="export-history-table">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Export Date</TableHead>
            <TableHead>Dataset</TableHead>
            <TableHead className="text-right">Jobs</TableHead>
            <TableHead className="text-right">Size</TableHead>
            <TableHead>Exported By</TableHead>
            <TableHead className="w-[80px]">Download</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {exports.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center text-muted-foreground h-24"
                data-testid="export-history-empty"
              >
                No exports yet
              </TableCell>
            </TableRow>
          ) : (
            exports.map((record) => (
              <TableRow key={record.id}>
                <TableCell className="text-muted-foreground">
                  {new Date(record.exportedAt).toLocaleString()}
                </TableCell>
                <TableCell className="font-medium">
                  {record.datasetName}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {record.jobCount}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatFileSize(record.fileSize)}
                </TableCell>
                <TableCell>{record.exportedBy?.name ?? "—"}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" asChild>
                    <a href={record.downloadUrl} download data-testid="export-download-button">
                      <Download className="h-4 w-4" />
                    </a>
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
