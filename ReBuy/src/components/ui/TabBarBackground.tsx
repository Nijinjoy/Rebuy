import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../../theme';

// How far the bump for the Sell button rises above the bar, and half its
// width where it meets the bar.
export const BUMP_RISE = 32;
const BUMP_HALF_WIDTH = 60;

// Top edge of the bar with a smooth bump in the middle, from left to right.
function topEdge(width: number) {
  const cx = width / 2;
  const w = BUMP_HALF_WIDTH;
  const t = BUMP_RISE;
  return (
    `M0 ${t} H${cx - w} ` +
    `C${cx - w / 2} ${t} ${cx - w / 2 + 2} 0 ${cx} 0 ` +
    `C${cx + w / 2 - 2} 0 ${cx + w / 2} ${t} ${cx + w} ${t} ` +
    `H${width}`
  );
}

// Tab bar background drawn as one shape, so the bump behind the Sell button
// is part of the bar rather than a separate circle on top of it.
function TabBarBackground() {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const { width, height } = size;
  const edge = topEdge(width);

  return (
    <View
      style={StyleSheet.absoluteFill}
      onLayout={e => setSize(e.nativeEvent.layout)}
    >
      {width > 0 && (
        <Svg width={width} height={height + BUMP_RISE} style={styles.svg}>
          <Path
            d={`${edge} V${height + BUMP_RISE} H0 Z`}
            fill={colors.surface}
          />
          <Path d={edge} fill="none" stroke={colors.border} strokeWidth={1} />
        </Svg>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  svg: {
    position: 'absolute',
    top: -BUMP_RISE,
    left: 0,
  },
});

export default TabBarBackground;
