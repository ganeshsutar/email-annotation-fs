import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { getDashboardPath } from "@/lib/authorization";

export const Route = createFileRoute("/unauthorized")({
  component: UnauthorizedPage,
});

function UnauthorizedPage() {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen items-center justify-center" data-testid="unauthorized-page">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">Unauthorized</h1>
        <p className="text-muted-foreground">
          You do not have permission to access this page.
        </p>
        <Button asChild>
          <Link to={user ? getDashboardPath(user.role) : "/login"}>
            {user ? "Go to Dashboard" : "Sign In"}
          </Link>
        </Button>
      </div>
    </div>
  );
}
