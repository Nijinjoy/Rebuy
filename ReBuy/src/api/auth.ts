import { useMockApi } from '../config/env';
import type { SignUpDetails, User } from '../types/user';
import { request } from './client';
import { mockResponse } from './mock';

export type Session = {
  user: User;
  token: string;
};

const MOCK_LATENCY_MS = 1200;

export function signIn(email: string, password: string): Promise<Session> {
  if (useMockApi) {
    return mockResponse(
      {
        user: { name: email.split('@')[0] || 'ReBuy user', email },
        token: 'mock-token',
      },
      MOCK_LATENCY_MS,
    );
  }
  return request<Session>('/auth/sign-in', {
    method: 'POST',
    body: { email, password },
  });
}

export function signUp(details: SignUpDetails): Promise<Session> {
  if (useMockApi) {
    return mockResponse(
      {
        user: { name: details.name || 'ReBuy user', email: details.email },
        token: 'mock-token',
      },
      MOCK_LATENCY_MS,
    );
  }
  return request<Session>('/auth/sign-up', { method: 'POST', body: details });
}

// Emails a reset link. Succeeds whether or not the email has an account,
// so the screen can't be used to find out who is registered.
export function requestPasswordReset(email: string): Promise<void> {
  if (useMockApi) {
    return mockResponse(undefined, MOCK_LATENCY_MS);
  }
  return request<void>('/auth/forgot-password', {
    method: 'POST',
    body: { email },
  });
}
