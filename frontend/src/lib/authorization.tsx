import { UserRole } from "@/types/enums";
import type { User } from "@/types/models";

const ROLE_DASHBOARDS: Record<string, string> = {
  [UserRole.ADMIN]: "/admin/dashboard",
  [UserRole.ANNOTATOR]: "/annotator/dashboard",
  [UserRole.QA]: "/qa/dashboard",
};

export function getDashboardPath(role: string): string {
  return ROLE_DASHBOARDS[role] ?? "/login";
}

export function hasRole(user: User, role: string): boolean {
  return user.role === role;
}
