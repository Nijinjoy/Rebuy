import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { DrawerScreenProps } from '@react-navigation/drawer';
import type {
  CompositeScreenProps,
  NavigatorScreenParams,
} from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Category } from '../types/listing';

// Route lists, outermost navigator first:
// RootStack → App (drawer) → Tabs (bottom tabs).

export type RootStackParamList = {
  // Signed out
  Login: undefined;
  SignUp: undefined;
  // Prefilled from the Login screen's email field.
  ForgotPassword: { email?: string } | undefined;
  // Signed in
  App: NavigatorScreenParams<DrawerParamList> | undefined;
  Chat: { chatId: string };
  Product: { productId: string };
  Orders: undefined;
  Favourites: undefined;
  Addresses: undefined;
  MyListings: undefined;
  Offers: undefined;
  Notifications: undefined;
  Privacy: undefined;
  Help: undefined;
};

export type DrawerParamList = {
  Tabs: NavigatorScreenParams<MainTabParamList> | undefined;
  Profile: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  // Opening Explore with a category selects it.
  Explore: { category?: Category } | undefined;
  Sell: undefined;
  Chats: undefined;
  Cart: undefined;
};

// Screen props: use these in screens instead of the library types, so
// `navigation` can reach routes in parent navigators too.

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type AppDrawerScreenProps<T extends keyof DrawerParamList> =
  CompositeScreenProps<
    DrawerScreenProps<DrawerParamList, T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;

export type TabScreenProps<T extends keyof MainTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, T>,
    AppDrawerScreenProps<keyof DrawerParamList>
  >;

// Types `useNavigation()` everywhere without passing a generic.
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
