import { useEffect, useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useStartAnnotation } from "@/features/annotations/api/start-annotation";
import { useJobForAnnotation } from "@/features/annotations/api/get-job-for-annotation";
import { AnnotationWorkspace } from "@/features/annotations/components/annotation-workspace";
import { JobStatus } from "@/types/enums";

export const Route = createFileRoute("/annotator/jobs/$jobId/annotate")({
  component: AnnotatePage,
});

function AnnotatePage() {
  const { jobId } = Route.useParams();
  const { data: job } = useJobForAnnotation(jobId);
  const startMutation = useStartAnnotation();
  const started = useRef(false);

  useEffect(() => {
    if (!job || started.current) return;
    if (
      job.status === JobStatus.ASSIGNED_ANNOTATOR ||
      job.status === JobStatus.QA_REJECTED
    ) {
      started.current = true;
      startMutation.mutate(jobId);
    }
  }, [job, jobId, startMutation]);

  return (
    <div className="h-full">
      <AnnotationWorkspace jobId={jobId} />
    </div>
  );
}
