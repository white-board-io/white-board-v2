export function mapClerkError(err: unknown): string {
  if (typeof err === "object" && err !== null && "errors" in err) {
    const errors = (err as { errors: { code?: string; longMessage?: string; message?: string }[] }).errors;
    const first = errors[0];
    switch (first?.code) {
      case "form_identifier_not_found":
        return "No account found with this email address.";
      case "form_password_incorrect":
        return "Incorrect password. Please try again.";
      case "form_identifier_exists":
        return "An account with this email already exists.";
      case "form_password_pwned":
        return "This password has been found in a data breach. Please choose another.";
      case "form_password_length_too_short":
        return "Password is too short.";
      case "form_code_incorrect":
      case "verification_failed":
        return "That code is incorrect. Please try again.";
      case "too_many_requests":
        return "Too many attempts. Please try again later.";
      default:
        return first?.longMessage ?? first?.message ?? "Something went wrong. Please try again.";
    }
  }
  return "Something went wrong. Please try again.";
}
