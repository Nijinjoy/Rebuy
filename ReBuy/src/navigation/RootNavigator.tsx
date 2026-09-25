import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import ChatScreen from '../screens/chat/ChatScreen';
import ProductScreen from '../screens/product/ProductScreen';
import AddressesScreen from '../screens/profile/AddressesScreen';
import FavouritesScreen from '../screens/profile/FavouritesScreen';
import HelpScreen from '../screens/profile/HelpScreen';
import MyListingsScreen from '../screens/profile/MyListingsScreen';
import NotificationsScreen from '../screens/profile/NotificationsScreen';
import OffersScreen from '../screens/profile/OffersScreen';
import OrdersScreen from '../screens/profile/OrdersScreen';
import PrivacyScreen from '../screens/profile/PrivacyScreen';
import AppDrawer from './AppDrawer';
import { navigationTheme } from './theme';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

function RootNavigator() {
  const { isSignedIn } = useAuth();

  // Switching groups on isSignedIn replaces the stack, so the user can't
  // swipe back to the login screen after signing in (or vice versa).
  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isSignedIn ? (
          <Stack.Group>
            <Stack.Screen name="App" component={AppDrawer} />
            <Stack.Screen name="Chat" component={ChatScreen} />
            <Stack.Screen name="Product" component={ProductScreen} />
            <Stack.Screen name="Orders" component={OrdersScreen} />
            <Stack.Screen name="Favourites" component={FavouritesScreen} />
            <Stack.Screen name="Addresses" component={AddressesScreen} />
            <Stack.Screen name="MyListings" component={MyListingsScreen} />
            <Stack.Screen name="Offers" component={OffersScreen} />
            <Stack.Screen
              name="Notifications"
              component={NotificationsScreen}
            />
            <Stack.Screen name="Privacy" component={PrivacyScreen} />
            <Stack.Screen name="Help" component={HelpScreen} />
          </Stack.Group>
        ) : (
          <Stack.Group>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
            <Stack.Screen
              name="ForgotPassword"
              component={ForgotPasswordScreen}
            />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default RootNavigator;
