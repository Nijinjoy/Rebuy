import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { useFavorites } from '../../context/FavoritesContext';
import { showAlert } from '../../components/ui/AlertProvider';
import Avatar from '../../components/ui/Avatar';
import Icon, { IconName } from '../../components/ui/Icon';
import ScreenPlaceholder from '../../components/ui/ScreenPlaceholder';
import { backendAssetUrl } from '../../config/env';
import { useAvatarActions } from '../../hooks/useAvatarActions';
import { logout } from '../../services/api/auth/authService';
import { getProfile } from '../../services/api/profile/profileService';
import type { AppDrawerScreenProps } from '../../navigation/types';
import { colors, fonts } from '../../theme';

type MenuRowProps = {
  icon: IconName;
  label: string;
  // Short text shown before the chevron, e.g. a count.
  detail?: string;
  onPress: () => void;
  last?: boolean;
};

function MenuRow({ icon, label, detail, onPress, last }: MenuRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={detail ? `${label}, ${detail}` : label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        !last && styles.rowDivider,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.rowIcon}>
        <Icon name={icon} color={colors.textPrimary} size={18} />
      </View>
      <Text style={styles.rowLabel}>{label}</Text>
      {!!detail && <Text style={styles.rowDetail}>{detail}</Text>}
      <Icon name="chevronRight" color={colors.placeholder} size={18} />
    </Pressable>
  );
}

function ProfileScreen({ navigation }: AppDrawerScreenProps<'Profile'>) {
  const { user, isSignedIn, updateUser, signOut } = useAuth();
  const { ids: favouriteIds } = useFavorites();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { hasPhoto, busy, changePhoto, removePhoto } = useAvatarActions();

  // Refetch whenever the screen comes into focus so edits show up.
  useFocusEffect(
    useCallback(() => {
      if (!isSignedIn) {
        return;
      }
      let active = true;
      setLoading(true);
      setError(null);
      getProfile()
        .then(response => {
          if (active && response.user) {
            updateUser(response.user);
          }
        })
        .catch(() => {
          if (active) {
            setError('Could not load your profile.');
          }
        })
        .finally(() => {
          if (active) {
            setLoading(false);
          }
        });
      return () => {
        active = false;
      };
    }, [isSignedIn, updateUser]),
  );

  const [loggingOut, setLoggingOut] = useState(false);

  // The session is cleared on this device even if the request fails.
  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } catch (logoutError) {
      if (__DEV__) {
        console.log('Logout request failed:', logoutError);
      }
    } finally {
      signOut();
    }
  };

  const confirmLogout = () => {
    showAlert(
      'Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: handleLogout },
      ],
      { icon: 'logout', tone: 'danger' },
    );
  };

  return (
    <ScreenPlaceholder
      title="Profile"
      description="Your account, listings and settings."
      onBack={() => navigation.navigate('Tabs')}
    >
      {user && (
        <View style={styles.card}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={hasPhoto ? 'Change photo' : 'Add photo'}
            disabled={busy}
            onPress={changePhoto}
            style={({ pressed }) => pressed && styles.pressedFade}
          >
            <Avatar
              name={user.name}
              size={96}
              uri={backendAssetUrl(user.avatar_url)}
            />
            {busy && (
              <View style={styles.avatarOverlay}>
                <ActivityIndicator color={colors.surface} />
              </View>
            )}
            <View style={styles.cameraBadge}>
              <Icon name="camera" color={colors.textPrimary} size={14} />
            </View>
          </Pressable>

          <Text style={styles.name}>{user.name}</Text>
          {!!user.email && <Text style={styles.email}>{user.email}</Text>}

          <View style={styles.photoActions}>
            <Pressable
              accessibilityRole="button"
              disabled={busy}
              onPress={changePhoto}
              style={({ pressed }) => [
                styles.photoButton,
                pressed && styles.pressedFade,
              ]}
            >
              <Icon name="camera" color={colors.textPrimary} size={16} />
              <Text style={styles.photoButtonText}>
                {hasPhoto ? 'Change photo' : 'Add photo'}
              </Text>
            </Pressable>
            {hasPhoto && (
              <Pressable
                accessibilityRole="button"
                disabled={busy}
                onPress={removePhoto}
                style={({ pressed }) => [
                  styles.photoButton,
                  styles.removeButton,
                  pressed && styles.pressedFade,
                ]}
              >
                <Icon name="trash" color={colors.error} size={16} />
                <Text style={[styles.photoButtonText, styles.removeText]}>
                  Remove
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      )}
      {loading && !user && (
        <ActivityIndicator color={colors.textPrimary} style={styles.status} />
      )}
      {!!error && <Text style={[styles.email, styles.status]}>{error}</Text>}

      <View style={styles.menu}>
        <MenuRow
          icon="package"
          label="My Orders"
          onPress={() => navigation.navigate('Orders')}
        />
        <MenuRow
          icon="heart"
          label="Favourites"
          detail={
            favouriteIds.length > 0 ? `${favouriteIds.length}` : undefined
          }
          onPress={() => navigation.navigate('Favourites')}
        />
        <MenuRow
          icon="mapPin"
          label="Addresses"
          onPress={() => navigation.navigate('Addresses')}
        />
        <MenuRow
          icon="sell"
          label="Sell on ReBuy"
          onPress={() => navigation.navigate('Tabs', { screen: 'Sell' })}
          last
        />
      </View>

      {isSignedIn && (
        <Pressable
          accessibilityRole="button"
          disabled={loggingOut}
          onPress={confirmLogout}
          style={({ pressed }) => [
            styles.logoutButton,
            pressed && styles.pressedFade,
          ]}
        >
          {loggingOut ? (
            <ActivityIndicator color={colors.error} />
          ) : (
            <>
              <Icon name="logout" color={colors.error} size={18} />
              <Text style={styles.logoutText}>Logout</Text>
            </>
          )}
        </Pressable>
      )}
    </ScreenPlaceholder>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    gap: 4,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  pressedFade: {
    opacity: 0.7,
  },
  avatarOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 48,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  cameraBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
    backgroundColor: colors.accent,
  },
  name: {
    marginTop: 12,
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.textPrimary,
  },
  email: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textSecondary,
  },
  photoActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  photoButtonText: {
    fontFamily: fonts.label,
    fontSize: 13,
    color: colors.textPrimary,
  },
  removeButton: {
    borderColor: colors.error,
  },
  removeText: {
    color: colors.error,
  },
  status: {
    marginTop: 12,
  },
  menu: {
    marginTop: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pressed: {
    backgroundColor: colors.accentTint,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentSoft,
  },
  rowLabel: {
    flex: 1,
    fontFamily: fonts.label,
    fontSize: 15,
    color: colors.textPrimary,
  },
  rowDetail: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.textSecondary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.error,
    backgroundColor: colors.surface,
  },
  logoutText: {
    fontFamily: fonts.label,
    fontSize: 15,
    color: colors.error,
  },
});

export default ProfileScreen;
