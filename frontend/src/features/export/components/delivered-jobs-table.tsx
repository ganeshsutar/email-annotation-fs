import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { DeliveredJob } from "../api/export-mapper";

interface DeliveredJobsTableProps {
  jobs: DeliveredJob[];
  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
}

export function DeliveredJobsTable({
  jobs,
  selectedIds,
  onSelectionChange,
}: DeliveredJobsTableProps) {
  const allSelected = jobs.length > 0 && jobs.every((j) => selectedIds.has(j.id));
  const someSelected = jobs.some((j) => selectedIds.has(j.id)) && !allSelected;

  function toggleAll() {
    if (allSelected) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(jobs.map((j) => j.id)));
    }
  }

  function toggleOne(id: string) {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    onSelectionChange(next);
  }

  return (
    <div>
      {selectedIds.size > 0 && (
        <p className="text-sm text-muted-foreground mb-2">
          {selectedIds.size} of {jobs.length} job(s) selected
        </p>
      )}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={allSelected ? true : someSelected ? "indeterminate" : false}
                  onCheckedChange={toggleAll}
                />
              </TableHead>
              <TableHead>File Name</TableHead>
              <TableHead>Annotator</TableHead>
              <TableHead>QA Reviewer</TableHead>
              <TableHead className="text-right">Annotations</TableHead>
              <TableHead>Delivered Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground h-24">
                  No delivered jobs found
                </TableCell>
              </TableRow>
            ) : (
              jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.has(job.id)}
                      onCheckedChange={() => toggleOne(job.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{job.fileName}</TableCell>
                  <TableCell>{job.annotator?.name ?? "—"}</TableCell>
                  <TableCell>{job.qaReviewer?.name ?? "—"}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {job.annotationCount}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(job.deliveredDate).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
