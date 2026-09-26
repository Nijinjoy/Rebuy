import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../../theme';

type Props = {
  title: string;
  // Optional button on the right, e.g. "View all".
  action?: { label: string; onPress: () => void };
};

// Section heading for Explore's browse view.
function SectionTitle({ title, action }: Props) {
  return (
    <View style={styles.header}>
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      {action && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${action.label}: ${title}`}
          hitSlop={8}
          onPress={action.onPress}
          style={({ pressed }) => [styles.action, pressed && styles.pressed]}
        >
          <Text style={styles.actionText}>{action.label}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.textPrimary,
  },
  action: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: colors.accentSoft,
  },
  actionText: {
    fontFamily: fonts.label,
    fontSize: 12,
    color: colors.textPrimary,
  },
  pressed: {
    opacity: 0.7,
  },
});

export default SectionTitle;
