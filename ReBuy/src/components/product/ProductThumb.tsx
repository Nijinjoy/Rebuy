import { Image, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../../theme';

type Props = {
  title: string;
  // Photo URL; the title's initial shows while it loads or if it's missing.
  uri?: string;
  size?: number;
  radius?: number;
};

function ProductThumb({ title, uri, size = 64, radius = 12 }: Props) {
  return (
    <View
      style={[
        styles.thumb,
        { width: size, height: size, borderRadius: radius },
      ]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Text style={[styles.initial, { fontSize: size * 0.38 }]}>
        {title.charAt(0).toUpperCase()}
      </Text>
      {!!uri && (
        <Image
          source={{ uri }}
          style={[StyleSheet.absoluteFill, styles.image]}
          resizeMode="cover"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  thumb: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentSoft,
    overflow: 'hidden',
  },
  image: {
    backgroundColor: colors.surface,
  },
  initial: {
    fontFamily: fonts.display,
    color: colors.textPrimary,
  },
});

export default ProductThumb;
