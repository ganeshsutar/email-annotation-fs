import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AnnotatorPerformance } from "../api/dashboard-mapper";

interface AnnotatorPerformanceTableProps {
  data: AnnotatorPerformance[];
}

type SortKey = keyof AnnotatorPerformance;

export function AnnotatorPerformanceTable({
  data,
}: AnnotatorPerformanceTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("completedJobs");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const sorted = useMemo(() => {
    return [...data].sort((a, b) => {
      const av = a[sortKey] ?? -1;
      const bv = b[sortKey] ?? -1;
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [data, sortKey, sortDir]);

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  function SortIndicator({ col }: { col: SortKey }) {
    if (col !== sortKey) return null;
    return <span className="ml-1">{sortDir === "asc" ? "\u2191" : "\u2193"}</span>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Annotator Performance</CardTitle>
        <CardDescription>
          Metrics for active annotators
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => handleSort("name")}
              >
                Name
                <SortIndicator col="name" />
              </TableHead>
              <TableHead
                className="text-right cursor-pointer select-none"
                onClick={() => handleSort("assignedJobs")}
              >
                Assigned
                <SortIndicator col="assignedJobs" />
              </TableHead>
              <TableHead
                className="text-right cursor-pointer select-none"
                onClick={() => handleSort("completedJobs")}
              >
                Completed
                <SortIndicator col="completedJobs" />
              </TableHead>
              <TableHead
                className="text-right cursor-pointer select-none"
                onClick={() => handleSort("inProgressJobs")}
              >
                In Progress
                <SortIndicator col="inProgressJobs" />
              </TableHead>
              <TableHead
                className="text-right cursor-pointer select-none"
                onClick={() => handleSort("acceptanceRate")}
              >
                Acceptance %
                <SortIndicator col="acceptanceRate" />
              </TableHead>
              <TableHead
                className="text-right cursor-pointer select-none"
                onClick={() => handleSort("avgAnnotationsPerJob")}
              >
                Avg Ann/Job
                <SortIndicator col="avgAnnotationsPerJob" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground h-24"
                >
                  No annotators found
                </TableCell>
              </TableRow>
            ) : (
              sorted.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {row.assignedJobs}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {row.completedJobs}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {row.inProgressJobs}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {row.acceptanceRate != null
                      ? `${row.acceptanceRate}%`
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {row.avgAnnotationsPerJob ?? "—"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
