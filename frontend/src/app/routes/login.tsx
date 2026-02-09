import { createFileRoute, isRedirect, redirect } from "@tanstack/react-router";
import { LoginForm } from "@/features/auth/components/login-form";
import { currentUserQueryOptions } from "@/features/auth/api/get-current-user";
import { getDashboardPath } from "@/lib/authorization";

export const Route = createFileRoute("/login")({
  beforeLoad: async ({ context }) => {
    try {
      const user = await context.queryClient.ensureQueryData(
        currentUserQueryOptions(),
      );
      throw redirect({ to: getDashboardPath(user.role) });
    } catch (err) {
      if (isRedirect(err)) throw err;
      // Not authenticated — show login page
    }
  },
  component: LoginPage,
});

function LoginPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between bg-primary p-10 text-primary-foreground">
        <div className="text-lg font-semibold">Email Annotation</div>
        <div className="space-y-2">
          <blockquote className="text-xl font-medium leading-relaxed">
            &ldquo;Accurate PII annotation is the foundation of privacy-safe data
            processing.&rdquo;
          </blockquote>
          <p className="text-sm opacity-80">
            Annotate, review, and export de-identified email datasets with
            confidence.
          </p>
        </div>
        <div className="text-xs opacity-60">
          Email PII De-Identification Platform
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex items-center justify-center p-8">
        <LoginForm />
      </div>
    </div>
  );
}
