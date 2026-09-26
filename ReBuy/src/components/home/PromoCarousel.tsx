import { useIsFocused } from '@react-navigation/native';
import { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors, fonts, palette, withAlpha } from '../../theme';
import Icon, { IconName } from '../ui/Icon';

export type Promo = {
  id: string;
  eyebrow: string;
  title: string;
  cta: string;
  icon: IconName;
  gradient: string;
  dark: boolean;
  target: 'Sell' | 'Explore' | 'Chats';
};

const PROMOS: Promo[] = [
  {
    id: 'sell',
    eyebrow: 'DECLUTTER & EARN',
    title: 'Sell your item\nin 60 seconds',
    cta: 'Start selling',
    icon: 'sell',
    gradient: `linear-gradient(135deg, ${palette.ink} 0%, #3B4F55 100%)`,
    dark: true,
    target: 'Sell',
  },
  {
    id: 'deals',
    eyebrow: 'HOT DEALS',
    title: 'Great finds under\nAED 500',
    cta: 'Shop deals',
    icon: 'explore',
    gradient: `linear-gradient(135deg, ${palette.gold} 0%, #E6C98A 100%)`,
    dark: false,
    target: 'Explore',
  },
  {
    id: 'chat',
    eyebrow: 'MAKE AN OFFER',
    title: 'Chat with sellers\nand get a better price',
    cta: 'Open chats',
    icon: 'chats',
    gradient: `linear-gradient(135deg, ${palette.sand} 0%, ${palette.ivory} 100%)`,
    dark: false,
    target: 'Chats',
  },
];

const GAP = 12;
const AUTO_SCROLL_MS = 4000;

type Props = {
  // Screen width, and the side padding the cards line up with.
  width: number;
  inset: number;
  onPress: (promo: Promo) => void;
};

// Promo banners that page through on their own, wrapping from the last back
// to the first. Auto-scroll waits while the user is swiping, restarts its
// countdown after they let go, and stops while the screen isn't in view.
function PromoCarousel({ width, inset, onPress }: Props) {
  const listRef = useRef<FlatList<Promo>>(null);
  const [index, setIndex] = useState(0);
  const indexRef = useRef(0);
  const dragging = useRef(false);
  const lastInteraction = useRef(Date.now());
  const isFocused = useIsFocused();

  const cardWidth = width - inset * 2;
  const step = cardWidth + GAP;

  useEffect(() => {
    if (!isFocused) {
      return;
    }
    const timer = setInterval(() => {
      if (
        dragging.current ||
        Date.now() - lastInteraction.current < AUTO_SCROLL_MS
      ) {
        return;
      }
      const next = (indexRef.current + 1) % PROMOS.length;
      listRef.current?.scrollToOffset({ offset: next * step, animated: true });
      lastInteraction.current = Date.now();
    }, 1000);
    return () => clearInterval(timer);
  }, [isFocused, step]);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const page = Math.min(
      PROMOS.length - 1,
      Math.max(0, Math.round(e.nativeEvent.contentOffset.x / step)),
    );
    if (page !== indexRef.current) {
      indexRef.current = page;
      setIndex(page);
    }
  };

  const endDrag = () => {
    dragging.current = false;
    lastInteraction.current = Date.now();
  };

  return (
    <View>
      <FlatList
        ref={listRef}
        horizontal
        data={PROMOS}
        keyExtractor={p => p.id}
        showsHorizontalScrollIndicator={false}
        snapToInterval={step}
        decelerationRate="fast"
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onScrollBeginDrag={() => {
          dragging.current = true;
        }}
        onScrollEndDrag={endDrag}
        onMomentumScrollEnd={endDrag}
        contentContainerStyle={[styles.promos, { paddingHorizontal: inset }]}
        renderItem={({ item }) => {
          const fg = item.dark ? colors.onPrimary : colors.textPrimary;
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${item.title.replace('\n', ' ')}. ${
                item.cta
              }`}
              onPress={() => onPress(item)}
              style={({ pressed }) => [
                styles.promo,
                { width: cardWidth, backgroundImage: item.gradient },
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.promoText}>
                <Text
                  style={[
                    styles.promoEyebrow,
                    { color: item.dark ? colors.accent : colors.textPrimary },
                  ]}
                >
                  {item.eyebrow}
                </Text>
                <Text style={[styles.promoTitle, { color: fg }]}>
                  {item.title}
                </Text>
                <View
                  style={[
                    styles.promoCta,
                    {
                      backgroundColor: item.dark
                        ? colors.accent
                        : colors.primary,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.promoCtaText,
                      {
                        color: item.dark ? colors.primary : colors.onPrimary,
                      },
                    ]}
                  >
                    {item.cta} →
                  </Text>
                </View>
              </View>
              <View
                style={[
                  styles.promoIcon,
                  {
                    backgroundColor: withAlpha(
                      item.dark ? palette.gold : palette.ink,
                      item.dark ? 0.2 : 0.08,
                    ),
                  },
                ]}
              >
                <Icon
                  name={item.icon}
                  color={item.dark ? colors.accent : colors.textPrimary}
                  size={40}
                />
              </View>
            </Pressable>
          );
        }}
      />
      <View style={styles.dots} accessibilityElementsHidden>
        {PROMOS.map((p, i) => (
          <View key={p.id} style={[styles.dot, i === index && styles.dotOn]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  promos: {
    gap: GAP,
  },
  promo: {
    height: 170,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 20,
    borderRadius: 24,
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.8,
  },
  promoText: {
    flex: 1,
    gap: 6,
  },
  promoEyebrow: {
    fontFamily: fonts.label,
    fontSize: 11,
    letterSpacing: 1.5,
  },
  promoTitle: {
    fontFamily: fonts.display,
    fontSize: 20,
    lineHeight: 25,
  },
  promoCta: {
    alignSelf: 'flex-start',
    marginTop: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
  },
  promoCtaText: {
    fontFamily: fonts.label,
    fontSize: 12,
  },
  promoIcon: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
  },
  dotOn: {
    width: 20,
    backgroundColor: colors.accent,
  },
});

export default PromoCarousel;
