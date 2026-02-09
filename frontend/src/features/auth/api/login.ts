import { apiClient } from "@/lib/api-client";
import type { User } from "@/types/models";
import { mapUser } from "./user-mapper";

export async function loginWithEmailAndPassword(data: {
  email: string;
  password: string;
}): Promise<User> {
  const response = await apiClient.post("/auth/login/", data);
  return mapUser(response.data);
}
