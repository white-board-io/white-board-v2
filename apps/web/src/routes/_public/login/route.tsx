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

const LOGIN_BACKGROUNDS = ["/images/login/1.jpg", "/images/login/2.jpg", "/images/login/3.jpg", "/images/login/4.jpg"];

export const Route = createFileRoute("/_public/login")({
  validateSearch: (search: Record<string, unknown>): { redirect_url?: string } => {
    const url = search.redirect_url;
    return typeof url === "string" ? { redirect_url: url } : {};
  },
  component: LoginPage,
});

const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginValues = z.infer<typeof loginSchema>;

const codeSchema = z.object({
  code: z.string().min(6, "Enter the 6-digit code").max(6, "Enter the 6-digit code"),
});

type CodeValues = z.infer<typeof codeSchema>;

function LoginPage() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { isLoaded: authLoaded, isSignedIn } = useAuth({ treatPendingAsSignedOut: false });
  const { redirect_url } = Route.useSearch();

  const [bg] = useState(() => {
    const idx = Math.floor(Math.random() * LOGIN_BACKGROUNDS.length);
    return LOGIN_BACKGROUNDS[idx] ?? LOGIN_BACKGROUNDS[0] ?? "";
  });

  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<"credentials" | "second-factor">("credentials");
  const [resent, setResent] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  const codeForm = useForm<CodeValues>({ resolver: zodResolver(codeSchema) });

  const completeSignIn = async (sessionId: string | null) => {
    if (!setActive) return;
    await setActive({ session: sessionId });
    // The redirect is handled by the `isSignedIn` guard below once Clerk
    // propagates the new session. Navigating here would race ahead of that
    // propagation and bounce through /login.
  };

  const onSubmit = async (values: LoginValues) => {
    if (!isLoaded) return;
    try {
      const result = await signIn.create({ identifier: values.email, password: values.password });
      if (result.status === "complete") {
        await completeSignIn(result.createdSessionId);
      } else if (result.status === "needs_second_factor") {
        await signIn.prepareSecondFactor({ strategy: "email_code" });
        setStep("second-factor");
      } else {
        setError("root", { message: "Additional verification is required to sign in. Please contact support." });
      }
    } catch (err) {
      setError("root", { message: mapClerkError(err) });
    }
  };

  const onSubmitCode = async (values: CodeValues) => {
    if (!isLoaded) return;
    try {
      const result = await signIn.attemptSecondFactor({ strategy: "email_code", code: values.code });
      if (result.status === "complete") {
        await completeSignIn(result.createdSessionId);
      } else {
        codeForm.setError("root", { message: "Verification could not be completed. Please try again." });
      }
    } catch (err) {
      codeForm.setError("root", { message: mapClerkError(err) });
    }
  };

  const resendCode = async () => {
    if (!isLoaded) return;
    try {
      await signIn.prepareSecondFactor({ strategy: "email_code" });
      setResent(true);
    } catch (err) {
      codeForm.setError("root", { message: mapClerkError(err) });
    }
  };

  // Wait for Clerk before showing the form, so an already-signed-in user is
  // redirected rather than able to submit a second sign-in ("already signed in").
  if (!authLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-5 h-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (isSignedIn) {
    return <Navigate to={redirect_url ?? "/discover"} replace />;
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
              <h1 className="text-2xl font-bold text-foreground">
                {step === "credentials" ? "Welcome back" : "Verify it's you"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {step === "credentials" ? "Sign in to continue" : "Enter the 6-digit code we emailed you"}
              </p>
            </div>
          </div>

          {step === "credentials" ? (
            <>
              {/* Form */}
              <form
                onSubmit={(e) => {
                  void handleSubmit(onSubmit)(e);
                }}
                className="space-y-4"
                noValidate
              >
                {/* Email */}
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    // eslint-disable-next-line jsx-a11y/no-autofocus
                    autoFocus
                    placeholder="Enter your email"
                    {...register("email")}
                  />
                  {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link to="/forgot-password" className="text-xs font-medium text-primary hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      className="pr-10"
                      {...register("password")}
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      onClick={() => {
                        setShowPassword((v) => !v);
                      }}
                      className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
                </div>

                {/* Form-level error */}
                {errors.root && (
                  <p role="alert" className="text-sm text-destructive">
                    {errors.root.message}
                  </p>
                )}

                <Button type="submit" disabled={isSubmitting || !isLoaded} className="w-full mt-4">
                  {isSubmitting ? "Signing in…" : "Sign in"}
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link to="/signup" className="font-semibold text-primary hover:underline">
                  Sign up
                </Link>
              </p>
            </>
          ) : (
            <form
              onSubmit={(e) => {
                void codeForm.handleSubmit(onSubmitCode)(e);
              }}
              className="space-y-4"
              noValidate
            >
              <div className="space-y-1.5">
                <Label htmlFor="code">Verification code</Label>
                <Input
                  id="code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  // eslint-disable-next-line jsx-a11y/no-autofocus
                  autoFocus
                  placeholder="123456"
                  className="tracking-[0.3em] placeholder:tracking-normal"
                  {...codeForm.register("code")}
                />
                {codeForm.formState.errors.code && (
                  <p className="text-sm text-destructive">{codeForm.formState.errors.code.message}</p>
                )}
              </div>

              {codeForm.formState.errors.root && (
                <p role="alert" className="text-sm text-destructive">
                  {codeForm.formState.errors.root.message}
                </p>
              )}

              <Button type="submit" disabled={codeForm.formState.isSubmitting || !isLoaded} className="w-full mt-4">
                {codeForm.formState.isSubmitting ? "Verifying…" : "Verify"}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                {resent ? (
                  <span>Code resent. Check your inbox.</span>
                ) : (
                  <>
                    Didn&apos;t get the code?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        void resendCode();
                      }}
                      className="font-semibold text-primary hover:underline cursor-pointer"
                    >
                      Resend code
                    </button>
                  </>
                )}
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
