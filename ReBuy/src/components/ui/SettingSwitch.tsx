import { StyleSheet, Switch, Text, View } from 'react-native';
import { colors, fonts } from '../../theme';

type Props = {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  last?: boolean;
};

// On/off row for settings lists, meant to sit inside a bordered card.
function SettingSwitch({
  label,
  description,
  value,
  onValueChange,
  last,
}: Props) {
  return (
    <View style={[styles.row, !last && styles.divider]}>
      <View style={styles.text}>
        <Text style={styles.label}>{label}</Text>
        {!!description && <Text style={styles.description}>{description}</Text>}
      </View>
      <Switch
        accessibilityLabel={label}
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: colors.accent }}
        thumbColor={colors.surface}
        ios_backgroundColor={colors.border}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  text: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontFamily: fonts.label,
    fontSize: 15,
    color: colors.textPrimary,
  },
  description: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 17,
    color: colors.textSecondary,
  },
});

export default SettingSwitch;
