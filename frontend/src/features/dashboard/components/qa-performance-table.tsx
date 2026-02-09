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
import type { QAPerformance } from "../api/dashboard-mapper";

interface QAPerformanceTableProps {
  data: QAPerformance[];
}

type SortKey = keyof QAPerformance;

export function QAPerformanceTable({ data }: QAPerformanceTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("reviewedJobs");
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
        <CardTitle>QA Performance</CardTitle>
        <CardDescription>Metrics for active QA reviewers</CardDescription>
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
                onClick={() => handleSort("reviewedJobs")}
              >
                Reviewed
                <SortIndicator col="reviewedJobs" />
              </TableHead>
              <TableHead
                className="text-right cursor-pointer select-none"
                onClick={() => handleSort("acceptedJobs")}
              >
                Accepted
                <SortIndicator col="acceptedJobs" />
              </TableHead>
              <TableHead
                className="text-right cursor-pointer select-none"
                onClick={() => handleSort("rejectedJobs")}
              >
                Rejected
                <SortIndicator col="rejectedJobs" />
              </TableHead>
              <TableHead
                className="text-right cursor-pointer select-none"
                onClick={() => handleSort("inReviewJobs")}
              >
                In Review
                <SortIndicator col="inReviewJobs" />
              </TableHead>
              <TableHead className="text-right">Avg Review Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground h-24"
                >
                  No QA reviewers found
                </TableCell>
              </TableRow>
            ) : (
              sorted.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {row.reviewedJobs}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {row.acceptedJobs}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {row.rejectedJobs}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {row.inReviewJobs}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {row.avgReviewTime ?? "—"}
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
