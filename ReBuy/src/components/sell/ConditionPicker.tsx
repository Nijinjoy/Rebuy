import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../../theme';
import { Condition, CONDITIONS } from '../../types/listing';

// What each condition means, so sellers pick the same one buyers expect.
const CONDITION_HINTS: Record<Condition, string> = {
  'Brand new': 'Unused, in original packaging',
  'Like new': 'Used once or twice, no marks',
  'Very good': 'Light use, barely visible wear',
  Good: 'Visible wear, works perfectly',
  Fair: 'Heavy wear or minor faults',
};

type Props = {
  selected: Condition | null;
  onSelect: (condition: Condition) => void;
  disabled?: boolean;
};

// A five-step scale from newest to most worn. Tapping a step selects it and
// shows its name and meaning above the scale.
function ConditionPicker({ selected, onSelect, disabled }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{selected ?? 'Tap a point on the scale'}</Text>
      <Text style={styles.hint}>
        {selected
          ? CONDITION_HINTS[selected]
          : 'Pick the one that best matches your item.'}
      </Text>

      <View style={styles.scale} accessibilityRole="radiogroup">
        <View style={styles.track} />
        {CONDITIONS.map(condition => {
          const isSelected = selected === condition;
          return (
            <Pressable
              key={condition}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected, disabled }}
              accessibilityLabel={`${condition}. ${CONDITION_HINTS[condition]}`}
              disabled={disabled}
              onPress={() => onSelect(condition)}
              style={styles.step}
            >
              {({ pressed }) => (
                <View
                  style={[
                    styles.dot,
                    pressed && styles.dotPressed,
                    isSelected && styles.dotSelected,
                  ]}
                />
              )}
            </Pressable>
          );
        })}
      </View>

      <View style={styles.ends}>
        <Text style={styles.end}>{CONDITIONS[0]}</Text>
        <Text style={styles.end}>{CONDITIONS[CONDITIONS.length - 1]}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: 28,
    paddingVertical: 20,
    borderRadius: 44,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 16,
    color: colors.textPrimary,
  },
  hint: {
    marginTop: 2,
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textSecondary,
  },
  scale: {
    flexDirection: 'row',
    marginTop: 8,
  },
  // Runs between the centres of the first and last steps.
  track: {
    position: 'absolute',
    left: '10%',
    right: '10%',
    top: 21,
    height: 2,
    backgroundColor: colors.accentSoft,
  },
  step: {
    flex: 1,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: colors.accent,
    backgroundColor: colors.surface,
  },
  dotPressed: {
    backgroundColor: colors.accentSoft,
  },
  dotSelected: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 5,
    borderColor: colors.primary,
    backgroundColor: colors.accent,
  },
  ends: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  end: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: colors.textSecondary,
  },
});

export default ConditionPicker;
