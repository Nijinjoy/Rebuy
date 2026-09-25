import type { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../../theme';
import Icon from './Icon';
import { BUMP_RISE } from './TabBarBackground';

const BUTTON = 52;
// Gap between the top of the bump and the top of the button.
const INSET = 7;

// Raised round button for the Sell tab. It sits in the bump drawn by
// TabBarBackground, so it stands out while staying part of the bar.
function SellTabButton({
  onPress,
  onLongPress,
  testID,
  'aria-selected': selected,
}: BottomTabBarButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Sell an item"
      accessibilityState={{ selected: !!selected }}
      onPress={onPress}
      onLongPress={onLongPress}
      testID={testID}
      style={styles.tab}
    >
      {({ pressed }) => (
        <>
          <View
            style={[
              styles.circle,
              selected && styles.circleSelected,
              pressed && styles.pressed,
            ]}
          >
            <Icon
              name="plus"
              color={selected ? colors.accent : colors.primary}
              size={26}
            />
          </View>
          <Text style={[styles.label, selected && styles.labelSelected]}>
            Sell
          </Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tab: {
    flex: 1,
    alignItems: 'center',
  },
  circle: {
    width: BUTTON,
    height: BUTTON,
    marginTop: INSET - BUMP_RISE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BUTTON / 2,
    backgroundColor: colors.accent,
  },
  circleSelected: {
    backgroundColor: colors.primary,
  },
  pressed: {
    transform: [{ scale: 0.94 }],
  },
  label: {
    marginTop: 2,
    fontFamily: fonts.label,
    fontSize: 11,
    color: colors.textPrimary,
  },
  labelSelected: {
    color: colors.primary,
  },
});

export default SellTabButton;
