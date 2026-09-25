import { StyleSheet, View } from 'react-native';
import Svg, { ClipPath, Defs, Path, Rect } from 'react-native-svg';
import { colors } from '../../theme';

type Props = {
  // 0–5; fractions fill part of a star.
  rating: number;
  size?: number;
};

// Lucide "star" outline (ISC license), drawn on a 24×24 grid.
const STAR =
  'M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z';

function Star({ fill, size, id }: { fill: number; size: number; id: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Defs>
        <ClipPath id={id}>
          <Rect x={0} y={0} width={24 * fill} height={24} />
        </ClipPath>
      </Defs>
      <Path d={STAR} fill={colors.accentSoft} />
      <Path d={STAR} fill={colors.accent} clipPath={`url(#${id})`} />
    </Svg>
  );
}

function StarRating({ rating, size = 14 }: Props) {
  return (
    <View
      style={styles.row}
      accessibilityRole="image"
      accessibilityLabel={`Rated ${rating.toFixed(1)} out of 5`}
    >
      {[0, 1, 2, 3, 4].map(i => (
        <Star
          key={i}
          id={`star-${i}`}
          size={size}
          fill={Math.min(1, Math.max(0, rating - i))}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 2,
  },
});

export default StarRating;
