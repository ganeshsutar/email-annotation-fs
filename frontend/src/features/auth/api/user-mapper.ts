import type { User } from "@/types/models";

export function mapUser(data: Record<string, unknown>): User {
  return {
    id: data.id as string,
    name: data.name as string,
    email: data.email as string,
    role: data.role as User["role"],
    status: data.status as User["status"],
    forcePasswordChange: data.force_password_change as boolean,
    createdAt: data.created_at as string,
  };
}
