import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUsers } from "@/features/users/api/get-users";
import { useUserWorkloads } from "@/features/job-assignment/api/get-user-workloads";
import { useAssignJobs } from "@/features/job-assignment/api/assign-jobs";
import type { User } from "@/types/models";
import { UserRole } from "@/types/enums";
import type { UserWorkload } from "../api/get-user-workloads";

interface AssignmentControlsPanelProps {
  selectedJobIds: Set<string>;
  type: "ANNOTATION" | "QA";
  onAssignComplete: () => void;
  onPreviewRoundRobin: (selectedUsers: User[], workloads: UserWorkload[]) => void;
}

export function AssignmentControlsPanel({
  selectedJobIds,
  type,
  onAssignComplete,
  onPreviewRoundRobin,
}: AssignmentControlsPanelProps) {
  const [strategy, setStrategy] = useState<"manual" | "round-robin">("manual");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [roundRobinUserIds, setRoundRobinUserIds] = useState<Set<string>>(
    new Set(),
  );

  const targetRole = type === "QA" ? UserRole.QA : UserRole.ANNOTATOR;
  const { data: usersData } = useUsers({
    role: targetRole,
    status: "ACTIVE",
    pageSize: 100,
  });
  const { data: workloads } = useUserWorkloads(type);
  const assignJobs = useAssignJobs();

  const users = usersData?.results ?? [];
  const workloadMap = new Map<string, number>();
  if (workloads) {
    for (const w of workloads) {
      workloadMap.set(w.userId, w.assignedCount);
    }
  }

  const selectedCount = selectedJobIds.size;

  async function handleManualAssign() {
    if (!selectedUserId || selectedCount === 0) return;
    await assignJobs.mutateAsync({
      jobIds: Array.from(selectedJobIds),
      assigneeId: selectedUserId,
      type,
    });
    onAssignComplete();
  }

  function handlePreviewRoundRobin() {
    const selectedUsers = users.filter((u) => roundRobinUserIds.has(u.id));
    onPreviewRoundRobin(selectedUsers, workloads ?? []);
  }

  function toggleRoundRobinUser(userId: string, checked: boolean) {
    const newSet = new Set(roundRobinUserIds);
    if (checked) {
      newSet.add(userId);
    } else {
      newSet.delete(userId);
    }
    setRoundRobinUserIds(newSet);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Assignment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup
          value={strategy}
          onValueChange={(v) => setStrategy(v as "manual" | "round-robin")}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="manual" id="strategy-manual" />
            <Label htmlFor="strategy-manual">Manual</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="round-robin" id="strategy-rr" />
            <Label htmlFor="strategy-rr">Round-Robin</Label>
          </div>
        </RadioGroup>

        {strategy === "manual" ? (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Assign to</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select user..." />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} ({workloadMap.get(user.id) ?? 0} assigned)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleManualAssign}
              disabled={
                !selectedUserId ||
                selectedCount === 0 ||
                assignJobs.isPending
              }
              className="w-full"
            >
              {assignJobs.isPending
                ? "Assigning..."
                : `Assign ${selectedCount} Job${selectedCount !== 1 ? "s" : ""}`}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <Label>Select users</Label>
            <div className="max-h-48 space-y-2 overflow-y-auto">
              {users.map((user) => (
                <div key={user.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`rr-user-${user.id}`}
                    checked={roundRobinUserIds.has(user.id)}
                    onCheckedChange={(checked) =>
                      toggleRoundRobinUser(user.id, !!checked)
                    }
                  />
                  <Label
                    htmlFor={`rr-user-${user.id}`}
                    className="text-sm font-normal"
                  >
                    {user.name}{" "}
                    <span className="text-muted-foreground">
                      ({workloadMap.get(user.id) ?? 0})
                    </span>
                  </Label>
                </div>
              ))}
            </div>
            <Button
              onClick={handlePreviewRoundRobin}
              disabled={roundRobinUserIds.size === 0 || selectedCount === 0}
              className="w-full"
            >
              Preview Distribution
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
