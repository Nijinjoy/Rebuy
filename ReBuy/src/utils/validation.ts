const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Error message for an email field, or undefined when it's valid.
export function validateEmail(email: string) {
  const value = email.trim();
  if (!value) {
    return 'Enter your email.';
  }
  if (!EMAIL_PATTERN.test(value)) {
    return 'Enter a valid email, like you@example.com.';
  }
  return undefined;
}
