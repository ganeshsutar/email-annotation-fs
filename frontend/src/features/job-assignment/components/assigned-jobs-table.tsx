import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { JobWithDatasetName } from "@/features/datasets/api/job-mapper";

interface AssignedJobsTableProps {
  jobs: JobWithDatasetName[];
  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
}

export function AssignedJobsTable({
  jobs,
  selectedIds,
  onSelectionChange,
}: AssignedJobsTableProps) {
  const allSelected =
    jobs.length > 0 && jobs.every((j) => selectedIds.has(j.id));

  function handleSelectAll(checked: boolean) {
    if (checked) {
      const newSet = new Set(selectedIds);
      for (const job of jobs) newSet.add(job.id);
      onSelectionChange(newSet);
    } else {
      const newSet = new Set(selectedIds);
      for (const job of jobs) newSet.delete(job.id);
      onSelectionChange(newSet);
    }
  }

  function handleSelectOne(id: string, checked: boolean) {
    const newSet = new Set(selectedIds);
    if (checked) {
      newSet.add(id);
    } else {
      newSet.delete(id);
    }
    onSelectionChange(newSet);
  }

  return (
    <div>
      <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]">
              <Checkbox
                checked={allSelected}
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead>File Name</TableHead>
            <TableHead>Dataset</TableHead>
            <TableHead>Current Assignee</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No assigned jobs found.
              </TableCell>
            </TableRow>
          ) : (
            jobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedIds.has(job.id)}
                    onCheckedChange={(checked) =>
                      handleSelectOne(job.id, !!checked)
                    }
                  />
                </TableCell>
                <TableCell className="font-medium">{job.fileName}</TableCell>
                <TableCell>{job.datasetName}</TableCell>
                <TableCell>
                  {job.assignedAnnotator?.name ?? job.assignedQa?.name ?? "—"}
                </TableCell>
                <TableCell>
                  {new Date(job.createdAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      </div>
      {selectedIds.size > 0 && (
        <div className="mt-2 text-sm text-muted-foreground">
          {selectedIds.size} of {jobs.length} selected
        </div>
      )}
    </div>
  );
}
