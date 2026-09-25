import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import * as authApi from '../api/auth';
import { setAuthToken } from '../api/client';
import type { SignUpDetails, User } from '../types/user';

type AuthContextValue = {
  user: User | null;
  isSignedIn: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (details: SignUpDetails) => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isSignedIn: user !== null,
      signIn: async (email, password) => {
        const session = await authApi.signIn(email, password);
        setAuthToken(session.token);
        setUser(session.user);
      },
      signUp: async details => {
        const session = await authApi.signUp(details);
        setAuthToken(session.token);
        setUser(session.user);
      },
      signOut: () => {
        setAuthToken(null);
        setUser(null);
      },
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
