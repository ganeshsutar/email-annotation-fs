import { useState, useCallback } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useVersionHistory } from "../api/get-version-history";
import { useJobInfo } from "../api/get-job-info";
import { VersionTimeline } from "./version-timeline";
import { VersionComparisonPanel } from "./version-comparison-panel";
import { VersionDetailView } from "./version-detail-view";
import type { AnnotationVersionSummary } from "../api/history-mapper";

interface VersionHistoryPageProps {
  jobId: string;
  backLink: string;
}

export function VersionHistoryPage({
  jobId,
  backLink,
}: VersionHistoryPageProps) {
  const { data: history, isLoading: historyLoading } =
    useVersionHistory(jobId);
  const { data: jobInfo, isLoading: jobInfoLoading } = useJobInfo(jobId);

  const [detailViewOpen, setDetailViewOpen] = useState(false);
  const [detailVersion, setDetailVersion] =
    useState<AnnotationVersionSummary | null>(null);
  const [compareVersionId, setCompareVersionId] = useState<string | null>(null);

  const handleViewVersion = useCallback(
    (versionId: string) => {
      const version = history?.annotationVersions.find(
        (v) => v.id === versionId,
      );
      if (version) {
        setDetailVersion(version);
        setDetailViewOpen(true);
      }
    },
    [history],
  );

  const handleCompareVersion = useCallback((versionId: string) => {
    setCompareVersionId(versionId);
  }, []);

  if (historyLoading || jobInfoLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Loading version history...
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b px-4 py-3 flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link to={backLink}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-semibold truncate">
            {jobInfo?.fileName ?? "Job History"}
          </h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {jobInfo?.datasetName && <span>{jobInfo.datasetName}</span>}
            {jobInfo?.status && (
              <Badge variant="outline" className="text-xs">
                {jobInfo.status}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 min-h-0">
        <ResizablePanelGroup orientation="horizontal">
          <ResizablePanel defaultSize={35} minSize={25}>
            {history && jobInfo && (
              <VersionTimeline
                annotationVersions={history.annotationVersions}
                qaReviewVersions={history.qaReviewVersions}
                jobCreatedAt={jobInfo.createdAt}
                onViewVersion={handleViewVersion}
                onCompareVersion={handleCompareVersion}
              />
            )}
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={65} minSize={35}>
            {history && (
              <VersionComparisonPanel
                annotationVersions={history.annotationVersions}
                initialVersionBId={compareVersionId}
              />
            )}
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Detail dialog */}
      <VersionDetailView
        open={detailViewOpen}
        onOpenChange={setDetailViewOpen}
        version={detailVersion}
      />
    </div>
  );
}
