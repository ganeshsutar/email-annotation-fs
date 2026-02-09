import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useJobStatusCounts } from "@/features/dashboard/api/get-job-status-counts";
import { useDatasetOptions } from "@/features/dashboard/api/get-dataset-options";

const STATUS_LABELS: Record<string, string> = {
  UPLOADED: "Uploaded",
  ASSIGNED_ANNOTATOR: "Assigned",
  ANNOTATION_IN_PROGRESS: "Annotating",
  SUBMITTED_FOR_QA: "Submitted",
  ASSIGNED_QA: "QA Assigned",
  QA_IN_PROGRESS: "In QA",
  QA_REJECTED: "Rejected",
  QA_ACCEPTED: "Accepted",
  DELIVERED: "Delivered",
};

const STATUS_ORDER = [
  "UPLOADED",
  "ASSIGNED_ANNOTATOR",
  "ANNOTATION_IN_PROGRESS",
  "SUBMITTED_FOR_QA",
  "ASSIGNED_QA",
  "QA_IN_PROGRESS",
  "QA_REJECTED",
  "QA_ACCEPTED",
  "DELIVERED",
];

const chartConfig = {
  count: {
    label: "Jobs",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function JobStatusChart() {
  const [datasetId, setDatasetId] = useState<string>("all");
  const { data: datasets } = useDatasetOptions();
  const { data: statusCounts } = useJobStatusCounts(
    datasetId === "all" ? {} : { datasetId },
  );

  const data = useMemo(() => {
    if (!statusCounts) return [];
    return STATUS_ORDER.map((status) => ({
      status: STATUS_LABELS[status] ?? status,
      count: statusCounts[status] ?? 0,
    }));
  }, [statusCounts]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Job Status Distribution</CardTitle>
        <CardDescription>Current count of jobs by status</CardDescription>
        <CardAction>
          <Select value={datasetId} onValueChange={setDatasetId}>
            <SelectTrigger className="w-[160px]" size="sm">
              <SelectValue placeholder="All Datasets" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Datasets</SelectItem>
              {datasets?.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart
            data={data}
            margin={{ left: 10, right: 10, bottom: 40 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="status"
              type="category"
              tickLine={false}
              axisLine={false}
              fontSize={12}
              angle={-45}
              textAnchor="end"
            />
            <YAxis type="number" />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent />}
            />
            <Bar
              dataKey="count"
              fill="var(--color-count)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
