import { createFileRoute } from "@tanstack/react-router";
import { VersionHistoryPage } from "@/features/version-history/components/version-history-page";

export const Route = createFileRoute("/admin/jobs/$jobId/history")({
  component: AdminJobHistoryPage,
});

function AdminJobHistoryPage() {
  const { jobId } = Route.useParams();
  return <VersionHistoryPage jobId={jobId} backLink="/admin/datasets" />;
}
