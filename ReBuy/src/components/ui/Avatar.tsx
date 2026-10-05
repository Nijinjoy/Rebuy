import { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../../theme';

type Props = {
  name: string;
  size?: number;
  // Photo URL; initials are shown when missing or if it fails to load.
  uri?: string;
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters =
    parts.length > 1 ? [parts[0], parts[parts.length - 1]] : parts;
  return letters.map(p => p.charAt(0).toUpperCase()).join('') || '?';
}

function Avatar({ name, size = 56, uri }: Props) {
  const [failed, setFailed] = useState(false);

  // A new photo gets a fresh chance to load.
  useEffect(() => setFailed(false), [uri]);

  const shape = { width: size, height: size, borderRadius: size / 2 };

  return (
    <View
      style={[styles.avatar, shape]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {uri && !failed ? (
        <Image source={{ uri }} style={shape} onError={() => setFailed(true)} />
      ) : (
        <Text style={[styles.text, { fontSize: size * 0.36 }]}>
          {initials(name)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: colors.primary,
  },
  text: {
    fontFamily: fonts.display,
    color: colors.accent,
  },
});

export default Avatar;
