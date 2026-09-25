import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, fonts } from '../../theme';

type Props = {
  label: string;
  selected: boolean;
  onPress: () => void;
  // 'tab' for single-choice rows like categories, 'checkbox' for multi-select.
  role?: 'tab' | 'checkbox' | 'radio';
};

function Chip({ label, selected, onPress, role = 'tab' }: Props) {
  return (
    <Pressable
      accessibilityRole={role}
      accessibilityState={
        role === 'checkbox' ? { checked: selected } : { selected }
      }
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.chipSelected,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.text, selected && styles.textSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  text: {
    fontFamily: fonts.label,
    fontSize: 12,
    color: colors.textPrimary,
  },
  textSelected: {
    color: colors.onPrimary,
  },
  pressed: {
    opacity: 0.7,
  },
});

export default Chip;
