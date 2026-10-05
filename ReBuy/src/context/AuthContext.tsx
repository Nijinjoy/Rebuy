import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import axios from 'axios';
import { getProfile } from '../services/api/profile/profileService';
import { setAuthToken, setUnauthorizedHandler } from '../services/client';
import { storage } from '../services/storage';
import type { User } from '../types/user';

type AuthContextValue = {
  user: User | null;
  isSignedIn: boolean;
  // True while the saved session is being checked on app launch.
  isRestoring: boolean;
  // True after the user skips sign-up and browses without an account.
  isGuest: boolean;
  continueAsGuest: () => void;
  // Marks the user as signed in after a successful login API call.
  setSession: (user: User, token: string) => void;
  // Replaces the signed-in user with fresh data from the profile API.
  updateUser: (user: User) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

// Keeps the splash from hanging on a slow network at launch.
const PROFILE_CHECK_TIMEOUT_MS = 5000;

async function clearStoredSession() {
  await Promise.all([storage.removeToken(), storage.removeUser()]);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [isRestoring, setIsRestoring] = useState(true);

  const signOut = useCallback(() => {
    setAuthToken(null);
    clearStoredSession().catch(() => {});
    setUser(null);
    setIsGuest(false);
  }, []);

  // Stable so screens can list it as an effect dependency.
  const updateUser = useCallback((freshUser: User) => {
    setUser(freshUser);
    storage.setUser(freshUser).catch(() => {});
  }, []);

  // Restore the session saved by a previous launch.
  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const [token, savedUser] = await Promise.all([
          storage.getToken(),
          storage.getUser(),
        ]);

        // iOS keeps Keychain items after an uninstall while AsyncStorage is
        // wiped, so a token without a user is left over from an old install.
        if (!token || !savedUser) {
          await clearStoredSession();
          return;
        }

        setAuthToken(token);

        // Confirm the account still exists before the splash closes. 401 means
        // the token expired and 404 that the user was deleted; any other
        // failure (e.g. offline) falls back to the cached user.
        try {
          const response = await getProfile({
            timeout: PROFILE_CHECK_TIMEOUT_MS,
          });
          if (response.user) {
            storage.setUser(response.user).catch(() => {});
          }
          if (active) {
            setUser(response.user ?? savedUser);
          }
        } catch (error) {
          const status = axios.isAxiosError(error)
            ? error.response?.status
            : undefined;
          if (status === 401 || status === 404) {
            signOut();
          } else if (active) {
            setUser(savedUser);
          }
        }
      } catch (error) {
        // Unreadable storage: start signed out.
        if (__DEV__) {
          console.log('Could not restore session:', error);
        }
      } finally {
        if (active) {
          setIsRestoring(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [signOut]);

  // Any authenticated request rejected with 401 ends the session.
  useEffect(() => {
    setUnauthorizedHandler(signOut);
    return () => setUnauthorizedHandler(null);
  }, [signOut]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isSignedIn: user !== null,
      isRestoring,
      isGuest,
      continueAsGuest: () => setIsGuest(true),
      setSession: (sessionUser, token) => {
        setAuthToken(token);
        setUser(sessionUser);
        Promise.all([
          storage.setToken(token),
          storage.setUser(sessionUser),
        ]).catch(error => {
          if (__DEV__) {
            console.log('Could not save session:', error);
          }
        });
      },
      updateUser,
      signOut,
    }),
    [user, isRestoring, isGuest, updateUser, signOut],
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
