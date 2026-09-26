import { DrawerActions, useNavigation } from '@react-navigation/native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../../theme';
import Icon from './Icon';

type Props = {
  title: string;
  // Shows a back button instead of the menu button.
  onBack?: () => void;
  // Shows the title in a pill that matches the menu button, as the tabs do.
  pill?: boolean;
};

// Screen title with a menu button that opens the profile drawer.
function ScreenHeader({ title, onBack, pill }: Props) {
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
        {pill ? (
          <View style={styles.pill}>
            <Text
              style={styles.pillText}
              numberOfLines={1}
              accessibilityRole="header"
            >
              {title}
            </Text>
          </View>
        ) : (
          <Text style={styles.title}>{title}</Text>
        )}
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
  // Same height, rounding and border as the menu button.
  pill: {
    alignSelf: 'flex-start',
    maxWidth: '100%',
    height: 44,
    justifyContent: 'center',
    paddingHorizontal: 18,
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pillText: {
    fontFamily: fonts.display,
    fontSize: 16,
    color: colors.textPrimary,
  },
});

export default ScreenHeader;
