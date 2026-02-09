import { createFileRoute } from "@tanstack/react-router";
import { VersionHistoryPage } from "@/features/version-history/components/version-history-page";

export const Route = createFileRoute("/annotator/jobs/$jobId/history")({
  component: AnnotatorJobHistoryPage,
});

function AnnotatorJobHistoryPage() {
  const { jobId } = Route.useParams();
  return (
    <VersionHistoryPage jobId={jobId} backLink="/annotator/dashboard" />
  );
}
