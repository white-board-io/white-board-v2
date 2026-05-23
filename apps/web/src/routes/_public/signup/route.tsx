import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useSignUp, useAuth } from "@clerk/clerk-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import { mapClerkError } from "../../../lib/clerk-errors";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";

const SIGNUP_BACKGROUNDS = ["/images/login/1.jpg", "/images/login/2.jpg", "/images/login/3.jpg", "/images/login/4.jpg"];

export const Route = createFileRoute("/_public/signup")({
  component: SignupPage,
});

const detailsSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
type DetailsValues = z.infer<typeof detailsSchema>;

const verifySchema = z.object({
  code: z.string().min(6, "Enter the 6-digit code").max(6, "Enter the 6-digit code"),
});
type VerifyValues = z.infer<typeof verifySchema>;

function SignupPage() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const { isLoaded: authLoaded, isSignedIn } = useAuth({ treatPendingAsSignedOut: false });

  const [bg] = useState(() => {
    const idx = Math.floor(Math.random() * SIGNUP_BACKGROUNDS.length);
    return SIGNUP_BACKGROUNDS[idx] ?? SIGNUP_BACKGROUNDS[0] ?? "";
  });
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<"details" | "verify">("details");
  const [resent, setResent] = useState(false);

  const detailsForm = useForm<DetailsValues>({ resolver: zodResolver(detailsSchema) });
  const verifyForm = useForm<VerifyValues>({ resolver: zodResolver(verifySchema) });

  const onSubmitDetails = async (values: DetailsValues) => {
    if (!isLoaded) return;
    try {
      await signUp.create({
        firstName: values.firstName,
        lastName: values.lastName,
        emailAddress: values.email,
        password: values.password,
      });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setStep("verify");
    } catch (err) {
      detailsForm.setError("root", { message: mapClerkError(err) });
    }
  };

  const onSubmitVerify = async (values: VerifyValues) => {
    if (!isLoaded) return;
    try {
      const result = await signUp.attemptEmailAddressVerification({ code: values.code });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        // Redirect handled by the `isSignedIn` guard once Clerk propagates the
        // session (→ /discover, which routes a new User on to workspace creation).
      } else {
        verifyForm.setError("root", { message: "Verification could not be completed. Please try again." });
      }
    } catch (err) {
      verifyForm.setError("root", { message: mapClerkError(err) });
    }
  };

  const resendCode = async () => {
    if (!isLoaded) return;
    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setResent(true);
    } catch (err) {
      verifyForm.setError("root", { message: mapClerkError(err) });
    }
  };

  if (!authLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-5 h-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  // A signed-in User (including one who just completed verification) is routed
  // to /discover, which sends a User with no Workspace on to workspace creation.
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
              <h1 className="text-2xl font-bold text-foreground">
                {step === "details" ? "Create your account" : "Verify your email"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {step === "details" ? "Get started with Whiteboard" : "Enter the 6-digit code we emailed you"}
              </p>
            </div>
          </div>

          {step === "details" ? (
            <form
              onSubmit={(e) => {
                void detailsForm.handleSubmit(onSubmitDetails)(e);
              }}
              className="space-y-4"
              noValidate
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName">First name</Label>
                  <Input
                    id="firstName"
                    autoComplete="given-name"
                    placeholder="Arun Selva Kumar"
                    {...detailsForm.register("firstName")}
                  />
                  {detailsForm.formState.errors.firstName && (
                    <p className="text-sm text-destructive">{detailsForm.formState.errors.firstName.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input
                    id="lastName"
                    autoComplete="family-name"
                    placeholder="B"
                    {...detailsForm.register("lastName")}
                  />
                  {detailsForm.formState.errors.lastName && (
                    <p className="text-sm text-destructive">{detailsForm.formState.errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Enter your email"
                  {...detailsForm.register("email")}
                />
                {detailsForm.formState.errors.email && (
                  <p className="text-sm text-destructive">{detailsForm.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Create a password"
                    className="pr-10"
                    {...detailsForm.register("password")}
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
                {detailsForm.formState.errors.password && (
                  <p className="text-sm text-destructive">{detailsForm.formState.errors.password.message}</p>
                )}
              </div>

              {/* Clerk CAPTCHA mount target */}
              <div id="clerk-captcha" />

              {detailsForm.formState.errors.root && (
                <p role="alert" className="text-sm text-destructive">
                  {detailsForm.formState.errors.root.message}
                </p>
              )}

              <Button type="submit" disabled={detailsForm.formState.isSubmitting || !isLoaded} className="w-full mt-4">
                {detailsForm.formState.isSubmitting ? "Creating account…" : "Create account"}
              </Button>
            </form>
          ) : (
            <form
              onSubmit={(e) => {
                void verifyForm.handleSubmit(onSubmitVerify)(e);
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
                  {...verifyForm.register("code")}
                />
                {verifyForm.formState.errors.code && (
                  <p className="text-sm text-destructive">{verifyForm.formState.errors.code.message}</p>
                )}
              </div>

              {verifyForm.formState.errors.root && (
                <p role="alert" className="text-sm text-destructive">
                  {verifyForm.formState.errors.root.message}
                </p>
              )}

              <Button type="submit" disabled={verifyForm.formState.isSubmitting || !isLoaded} className="w-full mt-4">
                {verifyForm.formState.isSubmitting ? "Verifying…" : "Verify email"}
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

          {step === "details" && (
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-primary hover:underline">
                Sign in
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
