import { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { logo } from '../../assets/images';
import { colors, fonts } from '../../theme';

const SPLASH_DURATION_MS = 2800;

const STAR_SIZE = 190;
const LOGO_RADIUS = 26;

type Block = { width: number; height: number };

const TOWER: Block[] = [
  { width: 4, height: 30 },
  { width: 9, height: 22 },
  { width: 15, height: 26 },
  { width: 22, height: 30 },
  { width: 30, height: 34 },
];

const SKYLINE: (Block | 'tower')[] = [
  { width: 22, height: 46 },
  { width: 16, height: 70 },
  { width: 26, height: 54 },
  { width: 14, height: 92 },
  { width: 20, height: 64 },
  'tower',
  { width: 20, height: 74 },
  { width: 12, height: 104 },
  { width: 24, height: 58 },
  { width: 18, height: 80 },
  { width: 26, height: 44 },
];

type Props = {
  onFinish?: () => void;
};

function animate(
  value: Animated.Value,
  toValue: number,
  config: Omit<Animated.TimingAnimationConfig, 'toValue' | 'useNativeDriver'>,
) {
  return Animated.timing(value, { toValue, useNativeDriver: true, ...config });
}

function SplashScreen({ onFinish }: Props) {
  const starScale = useRef(new Animated.Value(0.7)).current;
  const starSpin = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const skylineRise = useRef(new Animated.Value(40)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const intro = Animated.parallel([
      Animated.spring(starScale, {
        toValue: 1,
        friction: 7,
        useNativeDriver: true,
      }),
      animate(starSpin, 1, {
        duration: SPLASH_DURATION_MS,
        easing: Easing.out(Easing.quad),
      }),
      animate(skylineRise, 0, {
        duration: 900,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.sequence([
        animate(logoOpacity, 1, { duration: 500 }),
        animate(textOpacity, 1, { duration: 500 }),
      ]),
    ]);
    intro.start();

    const timer = onFinish
      ? setTimeout(() => {
          animate(screenOpacity, 0, { duration: 300 }).start(() => onFinish());
        }, SPLASH_DURATION_MS)
      : undefined;

    return () => {
      clearTimeout(timer);
      intro.stop();
    };
  }, [
    logoOpacity,
    onFinish,
    screenOpacity,
    skylineRise,
    starScale,
    starSpin,
    textOpacity,
  ]);

  const spin = starSpin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  return (
    <Animated.View style={[styles.container, { opacity: screenOpacity }]}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.center}>
        <View style={styles.emblem}>
          <Animated.View
            style={[
              styles.starLayer,
              { transform: [{ scale: starScale }, { rotate: spin }] },
            ]}
          >
            <View style={styles.starSquare} />
            <View style={[styles.starSquare, styles.rotated]} />
          </Animated.View>
          <Animated.View style={[styles.logoCard, { opacity: logoOpacity }]}>
            <Image source={logo} style={styles.logo} />
          </Animated.View>
        </View>

        <Animated.View style={[styles.textBlock, { opacity: textOpacity }]}>
          <Text style={styles.titleEn}>REBUY</Text>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <View style={[styles.dividerDiamond, styles.rotated]} />
            <View style={styles.dividerLine} />
          </View>
          <Text style={styles.taglineEn}>Buy & sell pre-owned with trust</Text>
        </Animated.View>
      </View>

      <Animated.View
        style={[styles.skyline, { transform: [{ translateY: skylineRise }] }]}
        pointerEvents="none"
      >
        {SKYLINE.map((block, i) =>
          block === 'tower' ? (
            <View key={i} style={styles.tower}>
              {TOWER.map((segment, j) => (
                <View key={j} style={[styles.building, segment]} />
              ))}
            </View>
          ) : (
            <View key={i} style={[styles.building, block]} />
          ),
        )}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.background,
    backgroundImage: `linear-gradient(180deg, ${colors.background} 0%, ${colors.backgroundAlt} 100%)`,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 80,
  },
  emblem: {
    width: STAR_SIZE,
    height: STAR_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  starLayer: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  starSquare: {
    position: 'absolute',
    width: STAR_SIZE * Math.SQRT1_2,
    height: STAR_SIZE * Math.SQRT1_2,
    borderWidth: 1.5,
    borderColor: colors.accent,
    backgroundColor: colors.accentTint,
  },
  rotated: {
    transform: [{ rotate: '45deg' }],
  },
  logoCard: {
    borderRadius: LOGO_RADIUS,
    boxShadow: `0px 12px 28px ${colors.shadow}`,
  },
  logo: {
    width: 92,
    height: 92,
    borderRadius: LOGO_RADIUS,
  },
  textBlock: {
    alignItems: 'center',
    marginTop: 18,
  },
  titleEn: {
    color: colors.textPrimary,
    fontFamily: fonts.display,
    fontSize: 30,
    letterSpacing: 8,
    paddingLeft: 8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 14,
  },
  dividerLine: {
    width: 40,
    height: 1,
    backgroundColor: colors.accent,
  },
  dividerDiamond: {
    width: 6,
    height: 6,
    backgroundColor: colors.accent,
  },
  taglineEn: {
    marginTop: 4,
    color: colors.textSecondary,
    fontFamily: fonts.label,
    fontSize: 11,
    letterSpacing: 3,
    paddingLeft: 3,
    textTransform: 'uppercase',
  },
  skyline: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 4,
  },
  tower: {
    alignItems: 'center',
  },
  building: {
    backgroundColor: colors.accentSoft,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
});

export default SplashScreen;
