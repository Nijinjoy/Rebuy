const LATENCY_MS = 400;

// Resolves with `value` after a short delay, like a network call would.
export function mockResponse<T>(value: T, latency = LATENCY_MS): Promise<T> {
  return new Promise(resolve => setTimeout(() => resolve(value), latency));
}
