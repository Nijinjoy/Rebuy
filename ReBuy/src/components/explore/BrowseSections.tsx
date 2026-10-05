import { useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { EMIRATE_IMAGES } from '../../assets/images/emirates';
import { EMIRATES, emirateLocations, locationIsIn } from '../../data/areas';
import { colors, fonts } from '../../theme';
import type { Condition, Product } from '../../types/listing';
import { formatPrice } from '../../utils/format';
import { Filters, NO_FILTERS } from '../../utils/listingSearch';
import ProductCard from '../product/ProductCard';
import Icon from '../ui/Icon';
import SectionTitle from './SectionTitle';

const GAP = 12;
const EMIRATE_PHOTO = 48;
// Emirates shown before "View all": two rows of two.
const EMIRATE_PREVIEW = 4;

// Newest listings shown in the "Just listed" rail.
const JUST_LISTED = 6;
const JUST_LISTED_CARD = 150;

// Conditions shown as tiles, two rows of two, with what each one means.
// 'Fair' is left out to keep the grid even; it's still in the filter sheet.
const CONDITION_TILES: { condition: Condition; hint: string }[] = [
  { condition: 'Brand new', hint: 'Unused, in original packaging' },
  { condition: 'Like new', hint: 'Used once or twice, no marks' },
  { condition: 'Very good', hint: 'Light use, barely visible wear' },
  { condition: 'Good', hint: 'Regular use, some visible wear' },
];

const PRICE_RANGES: {
  label: string;
  min: number | null;
  max: number | null;
}[] = [
  { label: `Under ${formatPrice(100)}`, min: null, max: 100 },
  { label: `${formatPrice(100)} – 500`, min: 100, max: 500 },
  { label: `${formatPrice(500)} – 2,000`, min: 500, max: 2000 },
  { label: `Over ${formatPrice(2000)}`, min: 2000, max: null },
];

const countLabel = (n: number) => `${n} ${n === 1 ? 'item' : 'items'}`;

type Props = {
  listings: Product[];
  // Side padding of the screen, for sizing the emirate grid.
  inset: number;
  onFilter: (filters: Filters) => void;
  onProduct: (product: Product) => void;
};

// Explore's browse view: the newest listings, then emirates, conditions and
// price ranges. Each tile applies a filter; sections with nothing to show
// are left out.
function BrowseSections({ listings, inset, onFilter, onProduct }: Props) {
  const { width } = useWindowDimensions();
  const [allEmirates, setAllEmirates] = useState(false);

  // Emirates that have listings, busiest first (ties keep EMIRATES' order).
  const emirates = useMemo(
    () =>
      EMIRATES.map(emirate => {
        const locations = emirateLocations(emirate);
        return {
          name: emirate.name,
          locations,
          count: listings.filter(p => locationIsIn(p.location, locations))
            .length,
        };
      }),
    [listings],
  );
  const withItems = useMemo(
    () => emirates.filter(e => e.count > 0).sort((a, b) => b.count - a.count),
    [emirates],
  );
  // Collapsed: the busiest four with listings; with fewer than four and an
  // odd number, the next emirate without listings completes the bottom row.
  // "View all" shows all seven, those with listings first.
  const filler = emirates.find(e => e.count === 0);
  const collapsed =
    withItems.length > EMIRATE_PREVIEW
      ? withItems.slice(0, EMIRATE_PREVIEW)
      : withItems.length % 2 === 1 && filler
      ? [...withItems, filler]
      : withItems;
  const shownEmirates = allEmirates
    ? [...withItems, ...emirates.filter(e => e.count === 0)]
    : collapsed;

  // Two columns, filling the screen width.
  const emirateWidth = Math.floor((width - inset * 2 - GAP) / 2);

  const prices = useMemo(
    () =>
      PRICE_RANGES.map(range => ({
        ...range,
        count: listings.filter(
          p =>
            (range.min === null || p.price >= range.min) &&
            (range.max === null || p.price <= range.max),
        ).length,
      })),
    [listings],
  );

  // The API returns listings newest first.
  const justListed = listings.slice(0, JUST_LISTED);

  const conditions = useMemo(
    () =>
      CONDITION_TILES.map(tile => ({
        ...tile,
        count: listings.filter(p => p.condition === tile.condition).length,
      })),
    [listings],
  );

  return (
    <View style={styles.sections}>
      {justListed.length > 0 && (
        <View>
          <SectionTitle title="Just listed" />
          {/* Runs edge to edge, past the screen's side padding. */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginHorizontal: -inset }}
            contentContainerStyle={[styles.rail, { paddingHorizontal: inset }]}
          >
            {justListed.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                width={JUST_LISTED_CARD}
                onPress={() => onProduct(product)}
                hideAddButton
              />
            ))}
          </ScrollView>
        </View>
      )}

      {shownEmirates.length > 0 && (
        <View>
          <SectionTitle
            title="Browse by emirate"
            action={{
              label: allEmirates ? 'Show less' : 'View all',
              onPress: () => setAllEmirates(open => !open),
            }}
          />
          <View style={styles.emirateGrid}>
            {shownEmirates.map(emirate => (
              <Pressable
                key={emirate.name}
                accessibilityRole="button"
                accessibilityLabel={`${emirate.name}, ${countLabel(
                  emirate.count,
                )}`}
                onPress={() =>
                  onFilter({ ...NO_FILTERS, locations: emirate.locations })
                }
                style={({ pressed }) => [
                  styles.emirate,
                  { width: emirateWidth },
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.emirateImage}>
                  {EMIRATE_IMAGES[emirate.name] ? (
                    <Image
                      source={EMIRATE_IMAGES[emirate.name]!}
                      style={styles.emiratePhoto}
                      resizeMode="contain"
                    />
                  ) : (
                    <Text style={styles.emirateInitial}>
                      {emirate.name.charAt(0)}
                    </Text>
                  )}
                </View>
                <View style={styles.emirateText}>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {emirate.name}
                  </Text>
                  <Text style={styles.cardCount}>
                    {countLabel(emirate.count)}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      <View>
        <SectionTitle title="Shop by condition" />
        <View style={styles.priceGrid}>
          {conditions.map(({ condition, hint, count }) => (
            <Pressable
              key={condition}
              accessibilityRole="button"
              accessibilityLabel={`${condition}, ${countLabel(count)}`}
              onPress={() =>
                onFilter({ ...NO_FILTERS, conditions: [condition] })
              }
              style={({ pressed }) => [styles.price, pressed && styles.pressed]}
            >
              <Icon name="shield" color={colors.accent} size={18} />
              <Text style={styles.cardTitle} numberOfLines={1}>
                {condition}
              </Text>
              <Text style={styles.cardCount} numberOfLines={2}>
                {hint}
              </Text>
              <Text style={styles.cardCount}>{countLabel(count)}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View>
        <SectionTitle title="Shop by price" />
        <View style={styles.priceGrid}>
          {prices.map(range => (
            <Pressable
              key={range.label}
              accessibilityRole="button"
              accessibilityLabel={`${range.label}, ${countLabel(range.count)}`}
              onPress={() =>
                onFilter({
                  ...NO_FILTERS,
                  minPrice: range.min,
                  maxPrice: range.max,
                })
              }
              style={({ pressed }) => [styles.price, pressed && styles.pressed]}
            >
              <Icon name="tag" color={colors.accent} size={18} />
              <Text style={styles.cardTitle} numberOfLines={1}>
                {range.label}
              </Text>
              <Text style={styles.cardCount}>{countLabel(range.count)}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sections: {
    gap: 24,
    marginTop: 12,
  },
  rail: {
    gap: GAP,
  },
  emirateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
  },
  emirate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  emirateText: {
    flex: 1,
    gap: 2,
  },
  // The emirate's photo, or its initial until one is added.
  emirateImage: {
    width: EMIRATE_PHOTO,
    height: EMIRATE_PHOTO,
    borderRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentTint,
  },
  // Explicit size: with only absolute insets, a bundled image was drawn at
  // its full pixel size and clipped to its top-left corner.
  emiratePhoto: {
    width: EMIRATE_PHOTO,
    height: EMIRATE_PHOTO,
  },
  emirateInitial: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.accent,
  },
  // Two per row.
  priceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
  },
  price: {
    flexGrow: 1,
    flexBasis: '40%',
    gap: 4,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  cardTitle: {
    fontFamily: fonts.label,
    fontSize: 13,
    color: colors.textPrimary,
  },
  cardCount: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textSecondary,
  },
  pressed: {
    opacity: 0.7,
  },
});

export default BrowseSections;
