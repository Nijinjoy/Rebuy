import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../../theme';

type Props = {
  name: string;
  size?: number;
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters =
    parts.length > 1 ? [parts[0], parts[parts.length - 1]] : parts;
  return letters.map(p => p.charAt(0).toUpperCase()).join('') || '?';
}

// Initials avatar until profiles have photos.
function Avatar({ name, size = 56 }: Props) {
  return (
    <View
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Text style={[styles.text, { fontSize: size * 0.36 }]}>
        {initials(name)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  text: {
    fontFamily: fonts.display,
    color: colors.accent,
  },
});

export default Avatar;
