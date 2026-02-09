import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useChangePassword } from "@/features/auth/api/change-password";
import { useUser } from "@/lib/auth";
import { getDashboardPath } from "@/lib/authorization";

export function ChangePasswordForm() {
  const navigate = useNavigate();
  const user = useUser();
  const changePassword = useChangePassword();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const passwordsMatch = newPassword === confirmPassword;
  const isDisabled =
    !newPassword ||
    !confirmPassword ||
    !passwordsMatch ||
    changePassword.isPending;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!passwordsMatch) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await changePassword.mutateAsync({ new_password: newPassword });
      navigate({ to: getDashboardPath(user.role) });
    } catch (err: unknown) {
      if (
        err &&
        typeof err === "object" &&
        "response" in err &&
        (err as { response?: { data?: { new_password?: string[] } } }).response
          ?.data?.new_password
      ) {
        setError(
          (
            err as {
              response: { data: { new_password: string[] } };
            }
          ).response.data.new_password[0],
        );
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Change Password</CardTitle>
        <CardDescription>
          {user.forcePasswordChange
            ? "You must change your password before continuing."
            : "Enter a new password."}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
            {confirmPassword && !passwordsMatch && (
              <p className="text-sm text-destructive">
                Passwords do not match.
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isDisabled}>
            {changePassword.isPending
              ? "Changing password..."
              : "Change Password"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
