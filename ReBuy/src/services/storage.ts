import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Keychain from "react-native-keychain";
import type { User } from "../types/user";

// The token lives in the iOS Keychain / Android Keystore-backed storage.
// The user profile isn't secret, so it stays in AsyncStorage.
const TOKEN_SERVICE = "com.rebuy.auth";
const USER_KEY = "@rebuy_user";

export const storage = {
  setToken: async (token: string): Promise<void> => {
    await Keychain.setGenericPassword("auth_token", token, {
      service: TOKEN_SERVICE,
      accessible: Keychain.ACCESSIBLE.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
    });
  },

  getToken: async (): Promise<string | null> => {
    const credentials = await Keychain.getGenericPassword({
      service: TOKEN_SERVICE,
    });
    return credentials ? credentials.password : null;
  },

  removeToken: async (): Promise<void> => {
    await Keychain.resetGenericPassword({ service: TOKEN_SERVICE });
  },

  setUser: async (user: User): Promise<void> => {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  getUser: async (): Promise<User | null> => {
    const value = await AsyncStorage.getItem(USER_KEY);
    return value ? (JSON.parse(value) as User) : null;
  },

  removeUser: async (): Promise<void> => {
    await AsyncStorage.removeItem(USER_KEY);
  },
};
