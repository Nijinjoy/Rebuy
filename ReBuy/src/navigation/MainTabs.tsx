import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useCart } from '../context/CartContext';
import Icon, { IconName } from '../components/ui/Icon';
import SellTabButton from '../components/ui/SellTabButton';
import TabBarBackground from '../components/ui/TabBarBackground';
import CartScreen from '../screens/tabs/CartScreen';
import ChatsScreen from '../screens/tabs/ChatsScreen';
import ExploreScreen from '../screens/tabs/ExploreScreen';
import HomeScreen from '../screens/tabs/HomeScreen';
import SellScreen from '../screens/tabs/SellScreen';
import { colors, fonts } from '../theme';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

// Defined outside MainTabs so React sees a stable component type.
const tabIcon =
  (name: IconName) =>
  ({ color, size }: { color: string; size: number }) =>
    <Icon name={name} color={color} size={size} />;

function MainTabs() {
  const { count } = useCart();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.placeholder,
        tabBarLabelStyle: { fontFamily: fonts.label, fontSize: 11 },
        // The background draws the bar, its top border and the Sell bump
        // as one shape, so the default border and shadow are turned off.
        tabBarBackground: TabBarBackground,
        tabBarStyle: {
          borderTopWidth: 0,
          elevation: 0,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarIcon: tabIcon('home') }}
      />
      <Tab.Screen
        name="Explore"
        component={ExploreScreen}
        options={{ tabBarIcon: tabIcon('explore') }}
      />
      <Tab.Screen
        name="Sell"
        component={SellScreen}
        options={{ tabBarButton: SellTabButton }}
      />
      <Tab.Screen
        name="Chats"
        component={ChatsScreen}
        options={{ tabBarIcon: tabIcon('chats') }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          tabBarIcon: tabIcon('cart'),
          tabBarBadge: count > 0 ? (count > 99 ? '99+' : count) : undefined,
          tabBarBadgeStyle: {
            backgroundColor: colors.accent,
            color: colors.primary,
            fontFamily: fonts.label,
            fontSize: 10,
          },
        }}
      />
    </Tab.Navigator>
  );
}

export default MainTabs;
