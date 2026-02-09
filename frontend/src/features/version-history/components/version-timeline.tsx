import { useMemo } from "react";
import { Pencil, Check, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type {
  AnnotationVersionSummary,
  QAReviewVersionSummary,
} from "../api/history-mapper";

interface TimelineEntry {
  type: "annotation" | "qa_review" | "job_created";
  timestamp: string;
  annotationVersion?: AnnotationVersionSummary;
  qaReview?: QAReviewVersionSummary;
}

interface VersionTimelineProps {
  annotationVersions: AnnotationVersionSummary[];
  qaReviewVersions: QAReviewVersionSummary[];
  jobCreatedAt: string;
  onViewVersion: (versionId: string) => void;
  onCompareVersion: (versionId: string) => void;
  showCompare?: boolean;
}

export function VersionTimeline({
  annotationVersions,
  qaReviewVersions,
  jobCreatedAt,
  onViewVersion,
  onCompareVersion,
  showCompare = true,
}: VersionTimelineProps) {
  const entries = useMemo(() => {
    const items: TimelineEntry[] = [];

    for (const av of annotationVersions) {
      items.push({
        type: "annotation",
        timestamp: av.createdAt,
        annotationVersion: av,
      });
    }

    for (const qr of qaReviewVersions) {
      items.push({
        type: "qa_review",
        timestamp: qr.reviewedAt,
        qaReview: qr,
      });
    }

    items.push({
      type: "job_created",
      timestamp: jobCreatedAt,
    });

    // Sort newest first
    items.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    return items;
  }, [annotationVersions, qaReviewVersions, jobCreatedAt]);

  return (
    <ScrollArea className="h-full">
      <div className="space-y-4 p-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Timeline
        </h3>
        <div className="relative space-y-0">
          {entries.map((entry, idx) => (
            <div key={idx} className="relative flex gap-3 pb-6">
              {/* Vertical line */}
              {idx < entries.length - 1 && (
                <div className="absolute left-[15px] top-8 bottom-0 w-px bg-border" />
              )}

              {/* Icon */}
              <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-background">
                {entry.type === "annotation" && (
                  <Pencil className="h-3.5 w-3.5 text-blue-600" />
                )}
                {entry.type === "qa_review" &&
                  entry.qaReview?.decision === "ACCEPT" && (
                    <Check className="h-3.5 w-3.5 text-green-600" />
                  )}
                {entry.type === "qa_review" &&
                  entry.qaReview?.decision === "REJECT" && (
                    <X className="h-3.5 w-3.5 text-red-600" />
                  )}
                {entry.type === "job_created" && (
                  <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {entry.type === "annotation" && entry.annotationVersion && (
                  <AnnotationVersionCard
                    version={entry.annotationVersion}
                    onView={() => onViewVersion(entry.annotationVersion!.id)}
                    onCompare={() =>
                      onCompareVersion(entry.annotationVersion!.id)
                    }
                    showCompare={showCompare}
                  />
                )}
                {entry.type === "qa_review" && entry.qaReview && (
                  <QAReviewCard review={entry.qaReview} />
                )}
                {entry.type === "job_created" && (
                  <div className="rounded-lg border p-3">
                    <p className="text-sm font-medium">Job Created</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(entry.timestamp).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </ScrollArea>
  );
}

function AnnotationVersionCard({
  version,
  onView,
  onCompare,
  showCompare = true,
}: {
  version: AnnotationVersionSummary;
  onView: () => void;
  onCompare: () => void;
  showCompare?: boolean;
}) {
  return (
    <div className="rounded-lg border p-3 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            Version {version.versionNumber}
          </span>
          <Badge variant="outline" className="text-xs">
            {version.source}
          </Badge>
        </div>
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {version.annotationCount} annotations
        </span>
      </div>
      <p className="text-xs text-muted-foreground">
        {version.createdBy?.name ?? "Unknown"} &middot;{" "}
        {new Date(version.createdAt).toLocaleString()}
      </p>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onView}>
          View
        </Button>
        {showCompare && (
          <Button variant="outline" size="sm" onClick={onCompare}>
            Compare
          </Button>
        )}
      </div>
    </div>
  );
}

function QAReviewCard({ review }: { review: QAReviewVersionSummary }) {
  return (
    <div className="rounded-lg border p-3 space-y-1">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">QA Review</span>
        <Badge
          variant={review.decision === "ACCEPT" ? "default" : "destructive"}
          className="text-xs"
        >
          {review.decision}
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground">
        {review.reviewedBy?.name ?? "Unknown"} &middot;{" "}
        {new Date(review.reviewedAt).toLocaleString()}
      </p>
      {review.comments && (
        <p className="text-xs text-muted-foreground italic">
          &ldquo;{review.comments}&rdquo;
        </p>
      )}
    </div>
  );
}
