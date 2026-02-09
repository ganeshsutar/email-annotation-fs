import { useState } from "react";
import { Link } from "@tanstack/react-router";
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
import { useForgotPassword } from "@/features/auth/api/forgot-password";

export function ForgotPasswordForm() {
  const forgotPassword = useForgotPassword();

  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const isDisabled = !email || forgotPassword.isPending;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await forgotPassword.mutateAsync({ email });
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Check Your Email</CardTitle>
          <CardDescription>
            If an account exists with that email, we&apos;ve sent a reset link.
          </CardDescription>
        </CardHeader>
        <CardFooter className="justify-center">
          <Link
            to="/login"
            className="text-sm text-muted-foreground hover:underline"
          >
            Back to Sign In
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Forgot Password</CardTitle>
        <CardDescription>
          Enter your email and we&apos;ll send you a reset link.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {forgotPassword.isError && (
            <Alert variant="destructive">
              <AlertDescription>
                An error occurred. Please try again.
              </AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              autoFocus
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button type="submit" className="w-full" disabled={isDisabled}>
            {forgotPassword.isPending ? "Sending..." : "Send Reset Link"}
          </Button>
          <Link
            to="/login"
            className="text-sm text-muted-foreground hover:underline"
          >
            Back to Sign In
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}
