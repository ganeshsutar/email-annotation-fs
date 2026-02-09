import { useEffect, useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useJobForQAReview } from "@/features/qa-review/api/get-job-for-qa-review";
import { useStartQAReview } from "@/features/qa-review/api/start-qa-review";
import { QAReviewWorkspace } from "@/features/qa-review/components/qa-review-workspace";
import { JobStatus } from "@/types/enums";

export const Route = createFileRoute("/qa/jobs/$jobId/review")({
  component: QAReviewPage,
});

function QAReviewPage() {
  const { jobId } = Route.useParams();
  const { data: job } = useJobForQAReview(jobId);
  const startMutation = useStartQAReview();
  const started = useRef(false);

  useEffect(() => {
    if (!job || started.current) return;
    if (job.status === JobStatus.ASSIGNED_QA) {
      started.current = true;
      startMutation.mutate(jobId);
    }
  }, [job, jobId, startMutation]);

  return (
    <div className="h-full">
      <QAReviewWorkspace jobId={jobId} />
    </div>
  );
}
