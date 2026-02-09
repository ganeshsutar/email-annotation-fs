import { createFileRoute } from "@tanstack/react-router";
import { VersionHistoryPage } from "@/features/version-history/components/version-history-page";

export const Route = createFileRoute("/qa/jobs/$jobId/history")({
  component: QAJobHistoryPage,
});

function QAJobHistoryPage() {
  const { jobId } = Route.useParams();
  return <VersionHistoryPage jobId={jobId} backLink="/qa/dashboard" />;
}
