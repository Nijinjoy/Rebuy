import {
  createDrawerNavigator,
  DrawerContentComponentProps,
  DrawerContentScrollView,
} from '@react-navigation/drawer';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { backendAssetUrl } from '../config/env';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import LocationSheet from '../components/home/LocationSheet';
import Avatar from '../components/ui/Avatar';
import Icon, { IconName } from '../components/ui/Icon';
import { useAvatarActions } from '../hooks/useAvatarActions';
import ProfileScreen from '../screens/profile/ProfileScreen';
import { colors, fonts } from '../theme';
import MainTabs from './MainTabs';
import type { DrawerParamList, RootStackParamList } from './types';

const Drawer = createDrawerNavigator<DrawerParamList>();

// Drawer links that open a screen from the root stack.
type StackLink = keyof Pick<
  RootStackParamList,
  | 'MyListings'
  | 'Favourites'
  | 'Orders'
  | 'Offers'
  | 'Notifications'
  | 'Privacy'
  | 'Help'
>;

const ACTIVITY: { label: string; icon: IconName; route: StackLink }[] = [
  { label: 'My Listings', icon: 'tag', route: 'MyListings' },
  { label: 'Favorites', icon: 'heart', route: 'Favourites' },
  { label: 'My Orders', icon: 'package', route: 'Orders' },
  { label: 'Offers', icon: 'percent', route: 'Offers' },
];

type RowProps = {
  icon: IconName;
  label: string;
  // Short text shown before the chevron, e.g. the current setting.
  detail?: string;
  onPress: () => void;
};

function Row({ icon, label, detail, onPress }: RowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={detail ? `${label}, ${detail}` : label}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <Icon name={icon} color={colors.textPrimary} size={20} />
      <Text style={styles.rowLabel}>{label}</Text>
      {!!detail && (
        <Text style={styles.rowDetail} numberOfLines={1}>
          {detail}
        </Text>
      )}
      <Icon name="chevronRight" color={colors.placeholder} size={18} />
    </Pressable>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <Text style={styles.sectionTitle} accessibilityRole="header">
      {title}
    </Text>
  );
}

function HeaderButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}
    >
      <Text style={styles.headerButtonText}>{label}</Text>
    </Pressable>
  );
}

// "Sep 2026" from the account's created_at timestamp.
function formatMemberSince(createdAt?: string) {
  if (!createdAt) {
    return null;
  }
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function DrawerContent({ navigation }: DrawerContentComponentProps) {
  const { user, signOut } = useAuth();
  const memberSince = formatMemberSince(user?.created_at);
  const { hasPhoto, busy, changePhoto } = useAvatarActions();
  const { area, setArea } = useLocation();
  const [locationOpen, setLocationOpen] = useState(false);
  const insets = useSafeAreaInsets();

  // These screens live in the root stack, not the drawer, so they open
  // on top with a back button. Close the drawer so it isn't left open
  // underneath.
  const open = (route: StackLink) => {
    navigation.closeDrawer();
    navigation.navigate(route);
  };

  return (
    <View style={styles.container}>
      <DrawerContentScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.profile, { paddingTop: insets.top + 24 }]}>
          {user ? (
            <>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={hasPhoto ? 'Change photo' : 'Add photo'}
                disabled={busy}
                onPress={changePhoto}
                style={({ pressed }) => pressed && styles.pressed}
              >
                <Avatar
                  name={user.name}
                  size={72}
                  uri={backendAssetUrl(user.avatar_url)}
                />
                {busy && (
                  <View style={styles.avatarOverlay}>
                    <ActivityIndicator color={colors.surface} />
                  </View>
                )}
                <View style={styles.cameraBadge}>
                  <Icon name="camera" color={colors.textPrimary} size={12} />
                </View>
              </Pressable>
              <Text style={styles.name} numberOfLines={1}>
                {user.name}
              </Text>
              {!!user.email && (
                <Text style={styles.detail} numberOfLines={1}>
                  {user.email}
                </Text>
              )}
              {!!memberSince && (
                <Text style={styles.detail}>Member since {memberSince}</Text>
              )}
              {!!user.rating && (
                <Text style={styles.detail}>
                  <Text style={styles.star}>★ </Text>
                  {user.rating.toFixed(1)}
                </Text>
              )}
              <HeaderButton
                label="View Profile"
                onPress={() => {
                  navigation.closeDrawer();
                  navigation.navigate('Profile');
                }}
              />
            </>
          ) : (
            <>
              <Avatar name="Guest" size={72} />
              <Text style={styles.name}>Hello, Guest</Text>
              <Text style={styles.detail}>Sign in to buy, sell and chat.</Text>
              {/* Leaving guest mode swaps the stack back to Login. */}
              <HeaderButton label="Sign in" onPress={signOut} />
            </>
          )}
        </View>

        <SectionTitle title="My Activity" />
        {ACTIVITY.map(item => (
          <Row
            key={item.route}
            icon={item.icon}
            label={item.label}
            onPress={() => open(item.route)}
          />
        ))}

        <SectionTitle title="Settings" />
        <Row
          icon="bell"
          label="Notifications"
          onPress={() => open('Notifications')}
        />
        <Row
          icon="mapPin"
          label="Location"
          detail={area.name}
          onPress={() => setLocationOpen(true)}
        />
        <Row icon="shield" label="Privacy" onPress={() => open('Privacy')} />
        <Row icon="help" label="Help & Support" onPress={() => open('Help')} />
      </DrawerContentScrollView>

      <SafeAreaView edges={['bottom']} style={styles.footer}>
        <Pressable
          accessibilityRole="button"
          onPress={signOut}
          style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
        >
          <Icon name="logout" color={colors.error} size={20} />
          <Text style={[styles.rowLabel, styles.logout]}>Logout</Text>
        </Pressable>
      </SafeAreaView>

      <LocationSheet
        visible={locationOpen}
        selected={area}
        onSelect={setArea}
        onClose={() => setLocationOpen(false)}
      />
    </View>
  );
}

const renderDrawerContent = (props: DrawerContentComponentProps) => (
  <DrawerContent {...props} />
);

function AppDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={renderDrawerContent}
      screenOptions={{
        headerShown: false,
        drawerPosition: 'left',
        drawerType: 'front',
        drawerStyle: { backgroundColor: colors.background, width: 300 },
      }}
    >
      <Drawer.Screen name="Tabs" component={MainTabs} />
      {/* Opened from the Edit Profile button. */}
      <Drawer.Screen name="Profile" component={ProfileScreen} />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  // Drop the default padding so the profile header spans the full width.
  scroll: {
    paddingTop: 0,
    paddingStart: 0,
    paddingEnd: 0,
    paddingBottom: 16,
  },
  profile: {
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 4,
    backgroundColor: colors.backgroundAlt,
  },
  avatarOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 36,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  cameraBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.backgroundAlt,
    backgroundColor: colors.accent,
  },
  name: {
    marginTop: 10,
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.textPrimary,
  },
  detail: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.textSecondary,
  },
  star: {
    color: colors.accent,
  },
  headerButton: {
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  pressed: {
    opacity: 0.7,
  },
  headerButtonText: {
    fontFamily: fonts.label,
    fontSize: 13,
    color: colors.textPrimary,
  },
  sectionTitle: {
    marginTop: 20,
    marginBottom: 4,
    paddingHorizontal: 20,
    fontFamily: fonts.label,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.textSecondary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  rowPressed: {
    backgroundColor: colors.accentTint,
  },
  rowLabel: {
    flex: 1,
    fontFamily: fonts.label,
    fontSize: 14,
    color: colors.textPrimary,
  },
  rowDetail: {
    maxWidth: 100,
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textSecondary,
  },
  logout: {
    color: colors.error,
  },
  footer: {
    paddingVertical: 4,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});

export default AppDrawer;
