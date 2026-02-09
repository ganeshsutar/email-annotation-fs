import type { User } from "@/types/models";
import type { UserWorkload } from "../api/get-user-workloads";

export interface AssignmentPreview {
  user: User;
  jobIds: string[];
  currentWorkload: number;
  newTotal: number;
}

export function computeRoundRobinDistribution(
  jobIds: string[],
  selectedUsers: User[],
  workloads: UserWorkload[],
): AssignmentPreview[] {
  if (selectedUsers.length === 0 || jobIds.length === 0) return [];

  const workloadMap = new Map<string, number>();
  for (const w of workloads) {
    workloadMap.set(w.userId, w.assignedCount);
  }

  // Initialize tracker per user
  const tracker = selectedUsers.map((user) => ({
    user,
    currentWorkload: workloadMap.get(user.id) ?? 0,
    assigned: [] as string[],
    get total() {
      return this.currentWorkload + this.assigned.length;
    },
  }));

  // Assign each job to the user with the fewest total jobs
  for (const jobId of jobIds) {
    tracker.sort((a, b) => a.total - b.total);
    tracker[0].assigned.push(jobId);
  }

  return tracker.map((t) => ({
    user: t.user,
    jobIds: t.assigned,
    currentWorkload: t.currentWorkload,
    newTotal: t.currentWorkload + t.assigned.length,
  }));
}
