import { DrawerActions, useNavigation } from '@react-navigation/native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../../theme';
import Icon from './Icon';

type Props = {
  title: string;
  // Shows a back button instead of the menu button.
  onBack?: () => void;
};

// Screen title with a menu button that opens the profile drawer.
function ScreenHeader({ title, onBack }: Props) {
  const navigation = useNavigation();

  return (
    <View style={styles.header}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={onBack ? 'Go back' : 'Open menu'}
        hitSlop={8}
        onPress={
          onBack ?? (() => navigation.dispatch(DrawerActions.openDrawer()))
        }
        style={({ pressed }) => [styles.menu, pressed && styles.pressed]}
      >
        <Icon
          name={onBack ? 'back' : 'menu'}
          color={colors.textPrimary}
          size={22}
        />
      </Pressable>
      <View style={styles.titles}>
        <Text style={styles.title}>{title}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  menu: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.7,
  },
  titles: {
    flex: 1,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 26,
    color: colors.textPrimary,
  },
});

export default ScreenHeader;
