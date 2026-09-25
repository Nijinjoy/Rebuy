import { validateEmail } from '../src/utils/validation';

test('validateEmail accepts valid addresses', () => {
  expect(validateEmail('you@example.com')).toBeUndefined();
  expect(validateEmail('  you@example.com  ')).toBeUndefined();
});

test('validateEmail explains what is wrong', () => {
  expect(validateEmail('')).toBe('Enter your email.');
  expect(validateEmail('you@example')).toMatch(/valid email/);
  expect(validateEmail('you example.com')).toMatch(/valid email/);
});
