import axios from "axios";
import { toast } from "sonner";

function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()!.split(";").shift() || null;
  return null;
}

export function getApiErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? error.message : "An unexpected error occurred.";
  }
  const data = error.response?.data;
  if (!data) return error.message || "Network error. Check your connection.";

  if (typeof data.detail === "string") return data.detail;
  if (Array.isArray(data.non_field_errors) && data.non_field_errors.length > 0) {
    return data.non_field_errors.join(" ");
  }

  // Flatten field-level errors
  const fieldErrors: string[] = [];
  for (const [field, messages] of Object.entries(data)) {
    if (field === "detail" || field === "non_field_errors") continue;
    if (Array.isArray(messages)) {
      fieldErrors.push(`${field}: ${messages.join(", ")}`);
    } else if (typeof messages === "string") {
      fieldErrors.push(`${field}: ${messages}`);
    }
  }
  if (fieldErrors.length > 0) return fieldErrors.join(". ");

  return "An unexpected error occurred.";
}

export const apiClient = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const csrfToken = getCookie("csrftoken");
  if (csrfToken) {
    config.headers["X-CSRFToken"] = csrfToken;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!axios.isAxiosError(error) || !error.response) {
      toast.error("Network error. Check your connection.");
      return Promise.reject(error);
    }

    const status = error.response.status;

    if (status === 401) {
      const currentPath = window.location.pathname;
      if (currentPath !== "/login") {
        window.location.href = "/login";
      }
    } else if (status === 403) {
      // Don't show "Access denied" for auth-check requests (e.g. /api/auth/me/)
      // or on auth pages — a 403 there just means the user isn't logged in yet.
      // We check the request URL (not just window.location.pathname) because
      // during TanStack Router transitions the pathname hasn't updated yet.
      const requestUrl = error.config?.url || "";
      const isAuthCheck = requestUrl.includes("/auth/me");
      const authPages = ["/login", "/forgot-password", "/reset-password"];
      if (
        !isAuthCheck &&
        !authPages.some((p) => window.location.pathname.startsWith(p))
      ) {
        toast.error("Access denied.");
      }
    } else if (status === 409) {
      toast.error("This resource was modified. Please refresh.");
    } else if (status >= 500) {
      toast.error("Server error. Please try again.");
    }

    return Promise.reject(error);
  },
);
