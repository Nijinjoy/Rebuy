import { useState } from 'react';
import { useAuth } from './AuthContext';

// useState that goes back to its initial value whenever the user signs in
// or out, so one session's cart, chats, etc. never leak into the next.
// Resetting here, rather than remounting the providers, keeps the
// navigator mounted so the login ↔ app switch animates instead of flashing.
export function useSessionState<T>(initial: T) {
  const { isSignedIn } = useAuth();
  const [state, setState] = useState(initial);
  const [session, setSession] = useState(isSignedIn);

  // Adjusting state during render: React re-renders straight away, before
  // anything stale reaches the screen.
  if (session !== isSignedIn) {
    setSession(isSignedIn);
    setState(initial);
  }

  return [state, setState] as const;
}
