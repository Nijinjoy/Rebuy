import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useFavorites } from '../../context/FavoritesContext';
import Avatar from '../../components/ui/Avatar';
import Icon, { IconName } from '../../components/ui/Icon';
import ScreenPlaceholder from '../../components/ui/ScreenPlaceholder';
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
  const { user } = useAuth();
  const { ids: favouriteIds } = useFavorites();

  return (
    <ScreenPlaceholder
      title="Profile"
      description="Your account, listings and settings."
      onBack={() => navigation.navigate('Tabs')}
    >
      {user && (
        <View style={styles.card}>
          <Avatar name={user.name} size={64} />
          <View style={styles.info}>
            <Text style={styles.name}>{user.name}</Text>
            {!!user.email && <Text style={styles.email}>{user.email}</Text>}
          </View>
        </View>
      )}

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
    </ScreenPlaceholder>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.textPrimary,
  },
  email: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textSecondary,
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
});

export default ProfileScreen;
