import { createFileRoute } from "@tanstack/react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useBlindReviewSetting } from "@/features/dashboard/api/get-blind-review-setting";
import { useUpdateBlindReviewSetting } from "@/features/dashboard/api/update-blind-review-setting";

export const Route = createFileRoute("/admin/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { data: blindReview, isLoading } = useBlindReviewSetting();
  const updateBlindReview = useUpdateBlindReviewSetting();

  function handleToggle(checked: boolean) {
    updateBlindReview.mutate({ enabled: checked });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight lg:text-2xl">
          Settings
        </h1>
        <p className="text-muted-foreground">
          Platform configuration and preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>QA Review Settings</CardTitle>
          <CardDescription>
            Configure how QA reviewers interact with annotations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between space-x-4">
            <div className="space-y-1">
              <Label htmlFor="blind-review" className="text-sm font-medium">
                Blind Review Mode
              </Label>
              <p className="text-sm text-muted-foreground">
                When enabled, QA reviewers cannot see which annotator worked on
                each job. This reduces bias and ensures objective quality
                assessment.
              </p>
            </div>
            <Switch
              id="blind-review"
              checked={blindReview?.enabled ?? false}
              onCheckedChange={handleToggle}
              disabled={isLoading || updateBlindReview.isPending}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
