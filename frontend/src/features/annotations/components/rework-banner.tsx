import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { ReworkInfo } from "../api/annotation-mapper";

interface ReworkBannerProps {
  reworkInfo: ReworkInfo;
}

export function ReworkBanner({ reworkInfo }: ReworkBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const reviewDate = new Date(reworkInfo.reviewedAt).toLocaleString();

  return (
    <Alert className="border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20" data-testid="rework-banner">
      <AlertTriangle className="h-4 w-4 text-yellow-600" />
      <AlertTitle className="flex items-center justify-between">
        <span>QA Rejected — Rework Required</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 -mr-2 -mt-1"
          onClick={() => setDismissed(true)}
        >
          <X className="h-3 w-3" />
        </Button>
      </AlertTitle>
      <AlertDescription className="mt-1 space-y-1">
        <p className="text-sm" data-testid="rejection-comments">{reworkInfo.comments}</p>
        <p className="text-xs text-muted-foreground">
          {reworkInfo.reviewerName && <>Reviewed by {reworkInfo.reviewerName} &middot; </>}
          {reviewDate}
        </p>
      </AlertDescription>
    </Alert>
  );
}
