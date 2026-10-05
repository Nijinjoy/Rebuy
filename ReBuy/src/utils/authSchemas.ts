import { z } from 'zod';

export const MIN_PASSWORD_LENGTH = 6;

const emailSchema = z
  .string()
  .trim()
  .min(1, 'Enter your email.')
  .pipe(z.email('Enter a valid email, like you@example.com.'));

const passwordSchema = z
  .string()
  .min(1, 'Enter your password.')
  .min(
    MIN_PASSWORD_LENGTH,
    `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
  );

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const signUpSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Enter your full name.')
      .min(2, 'Name must be at least 2 characters.'),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirm your password.'),
    acceptedTerms: z
      .boolean()
      .refine(accepted => accepted, 'Accept the terms to continue.'),
  })
  // `when` lets the mismatch show alongside other field errors, not only
  // after every other field is valid.
  .refine(values => values.password === values.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
    when: ({ value }) =>
      typeof (value as { password?: unknown })?.password === 'string',
  });

export type LoginValues = z.input<typeof loginSchema>;
export type SignUpValues = z.input<typeof signUpSchema>;
