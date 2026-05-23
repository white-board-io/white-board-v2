import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useSignIn, useAuth } from "@clerk/clerk-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import { mapClerkError } from "../../../lib/clerk-errors";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";

const BACKGROUNDS = [
  "/images/login/1.jpg",
  "/images/login/2.jpg",
  "/images/login/3.jpg",
  "/images/login/4.jpg",
];

export const Route = createFileRoute("/_public/forgot-password")({
  component: ForgotPasswordPage,
});

const requestSchema = z.object({
  email: z.email("Enter a valid email address"),
});
type RequestValues = z.infer<typeof requestSchema>;

const resetSchema = z.object({
  code: z.string().min(6, "Enter the 6-digit code").max(6, "Enter the 6-digit code"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
type ResetValues = z.infer<typeof resetSchema>;

function ForgotPasswordPage() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const { isLoaded: authLoaded, isSignedIn } = useAuth({ treatPendingAsSignedOut: false });

  const [bg] = useState(() => {
    const idx = Math.floor(Math.random() * BACKGROUNDS.length);
    return BACKGROUNDS[idx] ?? BACKGROUNDS[0] ?? "";
  });
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<"request" | "reset">("request");

  const requestForm = useForm<RequestValues>({ resolver: zodResolver(requestSchema) });
  const resetForm = useForm<ResetValues>({ resolver: zodResolver(resetSchema) });

  const onSubmitRequest = async (values: RequestValues) => {
    if (!isLoaded) return;
    try {
      await signIn.create({ strategy: "reset_password_email_code", identifier: values.email });
      setStep("reset");
    } catch (err) {
      requestForm.setError("root", { message: mapClerkError(err) });
    }
  };

  const onSubmitReset = async (values: ResetValues) => {
    if (!isLoaded) return;
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: values.code,
        password: values.password,
      });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        // Redirect handled by the `isSignedIn` guard once Clerk propagates the session.
      } else {
        resetForm.setError("root", { message: "Could not reset password. Please try again." });
      }
    } catch (err) {
      resetForm.setError("root", { message: mapClerkError(err) });
    }
  };

  if (!authLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-5 h-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  // A signed-in User (including one who just reset their password) goes to /discover.
  if (isSignedIn) {
    return <Navigate to="/discover" replace />;
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left panel — image */}
      <div className="hidden lg:block flex-1 relative overflow-hidden">
        <img src={bg} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-brand-900/30" />
      </div>

      {/* Right panel — form */}
      <div className="w-full lg:w-[480px] shrink-0 flex flex-col items-center justify-center px-8 py-16">
        <div className="w-full max-w-[352px] space-y-8">
          {/* Logo + heading */}
          <div className="flex flex-col items-center gap-4 text-center">
            <img src="/whiteboard-logo.svg" alt="WhiteBoard" className="w-12 h-12" />
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-foreground">Reset your password</h1>
              <p className="text-sm text-muted-foreground">
                {step === "request"
                  ? "We'll email you a reset code"
                  : "Enter the code and choose a new password"}
              </p>
            </div>
          </div>

          {step === "request" ? (
            <form
              onSubmit={(e) => { void requestForm.handleSubmit(onSubmitRequest)(e); }}
              className="space-y-4"
              noValidate
            >
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  // eslint-disable-next-line jsx-a11y/no-autofocus
                  autoFocus
                  placeholder="Enter your email"
                  {...requestForm.register("email")}
                />
                {requestForm.formState.errors.email && (
                  <p className="text-sm text-destructive">{requestForm.formState.errors.email.message}</p>
                )}
              </div>

              {requestForm.formState.errors.root && (
                <p role="alert" className="text-sm text-destructive">
                  {requestForm.formState.errors.root.message}
                </p>
              )}

              <Button
                type="submit"
                disabled={requestForm.formState.isSubmitting || !isLoaded}
                className="w-full mt-4"
              >
                {requestForm.formState.isSubmitting ? "Sending…" : "Send reset code"}
              </Button>
            </form>
          ) : (
            <form
              onSubmit={(e) => { void resetForm.handleSubmit(onSubmitReset)(e); }}
              className="space-y-4"
              noValidate
            >
              <div className="space-y-1.5">
                <Label htmlFor="code">Reset code</Label>
                <Input
                  id="code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  // eslint-disable-next-line jsx-a11y/no-autofocus
                  autoFocus
                  placeholder="123456"
                  className="tracking-[0.3em] placeholder:tracking-normal"
                  {...resetForm.register("code")}
                />
                {resetForm.formState.errors.code && (
                  <p className="text-sm text-destructive">{resetForm.formState.errors.code.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">New password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Choose a new password"
                    className="pr-10"
                    {...resetForm.register("password")}
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => { setShowPassword((v) => !v); }}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {resetForm.formState.errors.password && (
                  <p className="text-sm text-destructive">{resetForm.formState.errors.password.message}</p>
                )}
              </div>

              {resetForm.formState.errors.root && (
                <p role="alert" className="text-sm text-destructive">
                  {resetForm.formState.errors.root.message}
                </p>
              )}

              <Button
                type="submit"
                disabled={resetForm.formState.isSubmitting || !isLoaded}
                className="w-full mt-4"
              >
                {resetForm.formState.isSubmitting ? "Resetting…" : "Reset password"}
              </Button>
            </form>
          )}

          <p className="text-center text-sm text-muted-foreground">
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
