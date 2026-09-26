import { DrawerActions } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PromoCarousel from '../../components/home/PromoCarousel';
import ProductCard from '../../components/product/ProductCard';
import ProductThumb from '../../components/product/ProductThumb';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import Icon from '../../components/ui/Icon';
import LoadingState from '../../components/ui/LoadingState';
import SearchField from '../../components/ui/SearchField';
import { useFavorites } from '../../context/FavoritesContext';
import { useLocation } from '../../context/LocationContext';
import { Area, distanceKm, findArea } from '../../data/areas';
import { useListings } from '../../hooks/useListings';
import type { TabScreenProps } from '../../navigation/types';
import { CATEGORIES, Product } from '../../types/listing';
import { colors, fonts, palette } from '../../theme';
import { getCurrentArea, LocationError } from '../../utils/currentLocation';
import { formatPrice } from '../../utils/format';
import { NO_FILTERS, searchListings } from '../../utils/listingSearch';

const PADDING = 24;
const GAP = 12;
const DEAL_LIMIT = 500;
const NEARBY_KM = 25;
// Nearby and deals show as two rows of three.
const GRID_COLUMNS = 3;
const GRID_COUNT = GRID_COLUMNS * 2;
const PRELOAD_TABS = ['Explore', 'Cart', 'Chats', 'Sell'] as const;

// Listings priced up to DEAL_LIMIT, cheapest first.
function deals(listings: Product[]) {
  return listings
    .filter(p => p.price <= DEAL_LIMIT)
    .sort((a, b) => a.price - b.price)
    .slice(0, GRID_COUNT);
}

// The GRID_COUNT listings closest to `area`, within NEARBY_KM, with their
// distance.
function nearby(listings: Product[], area: Area) {
  return listings
    .flatMap(product => {
      const listingArea = findArea(product.location);
      if (!listingArea) {
        return [];
      }
      const km = distanceKm(area, listingArea);
      return km <= NEARBY_KM ? [{ product, km }] : [];
    })
    .sort((a, b) => a.km - b.km)
    .slice(0, GRID_COUNT);
}

function formatKm(km: number) {
  return km < 1 ? '<1 km' : `${Math.round(km)} km`;
}

// Until there's a recommendations API: listings from categories the user
// has saved items in come first, then the best-rated sellers. Items they've
// already saved are skipped.
function recommend(listings: Product[], savedIds: string[]) {
  const savedCategories = new Set(
    listings.filter(p => savedIds.includes(p.id)).map(p => p.category),
  );
  return listings
    .filter(p => !savedIds.includes(p.id))
    .sort(
      (a, b) =>
        Number(savedCategories.has(b.category)) -
          Number(savedCategories.has(a.category)) ||
        b.sellerRating - a.sellerRating,
    )
    .slice(0, 8);
}

// Compact listing card: photo with a price tag, the title, and a caption.
function RailCard({
  product,
  caption,
  width = 140,
  onPress,
}: {
  product: Product;
  caption: string;
  width?: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${product.title}, ${formatPrice(product.price)}`}
      onPress={onPress}
      style={({ pressed }) => [{ width }, pressed && styles.pressed]}
    >
      <View>
        <ProductThumb
          title={product.title}
          uri={product.images[0]}
          size={width}
          radius={18}
        />
        <View style={styles.priceTag}>
          <Text style={styles.priceTagText}>{formatPrice(product.price)}</Text>
        </View>
      </View>
      <Text style={styles.railTitle} numberOfLines={2}>
        {product.title}
      </Text>
      <Text style={styles.railCaption} numberOfLines={1}>
        {caption}
      </Text>
    </Pressable>
  );
}

// Cover photo for each category: its newest listing's first image.
function categoryTiles(listings: Product[]) {
  return CATEGORIES.map(category => ({
    category,
    image: listings.find(p => p.category === category)?.images[0],
  }));
}

function SectionHeader({
  title,
  onSeeAll,
}: {
  title: string;
  onSeeAll: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle} accessibilityRole="header">
        {title}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`See all: ${title}`}
        hitSlop={8}
        onPress={onSeeAll}
        style={({ pressed }) => [styles.seeAll, pressed && styles.pressed]}
      >
        <Text style={styles.seeAllText}>See all</Text>
      </Pressable>
    </View>
  );
}

// Landing tab: the user's current location, a search field that lists
// matching items as they type, and promo banners while not searching.
function HomeScreen({ navigation }: TabScreenProps<'Home'>) {
  const { area, setArea } = useLocation();
  // Whether `area` came from GPS this session, rather than the default.
  const [located, setLocated] = useState(false);
  const [locating, setLocating] = useState(false);

  const { width } = useWindowDimensions();
  const cardWidth = (width - PADDING * 2 - GAP) / 2;
  const { data: listings, error, refetch } = useListings();
  const [query, setQuery] = useState('');
  const searching = query.trim().length > 0;
  const { ids: savedIds } = useFavorites();
  const recommended = useMemo(
    () => recommend(listings ?? [], savedIds),
    [listings, savedIds],
  );
  // Only once GPS has found the user, so distances aren't from a default.
  const nearbyListings = useMemo(
    () => (located ? nearby(listings ?? [], area) : []),
    [listings, area, located],
  );
  // Rounded down so rounding can't push the third card onto a new row.
  const gridCardWidth = Math.floor(
    (width - PADDING * 2 - GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS,
  );
  const dealListings = useMemo(() => deals(listings ?? []), [listings]);
  const tiles = useMemo(() => categoryTiles(listings ?? []), [listings]);
  const results = useMemo(
    () =>
      searching
        ? searchListings(listings ?? [], {
            query,
            category: null,
            filters: NO_FILTERS,
            sort: 'newest',
          })
        : [],
    [listings, query, searching],
  );

  // `quiet` skips the error alert, for the automatic lookup on open.
  const locate = useCallback(
    async (quiet = false) => {
      setLocating(true);
      try {
        setArea(await getCurrentArea());
        setLocated(true);
      } catch (err) {
        if (!quiet) {
          Alert.alert(
            'Location unavailable',
            err instanceof LocationError
              ? err.message
              : 'Something went wrong. Please try again.',
          );
        }
      } finally {
        setLocating(false);
      }
    },
    [setArea],
  );

  useEffect(() => {
    locate(true);
  }, [locate]);

  // Tabs mount on first visit, which makes that first switch stutter.
  // Home is the first tab, so it mounts the others in the background once
  // it has settled, one at a time so no single frame does all the work.
  useEffect(() => {
    const timers = PRELOAD_TABS.map((tab, i) =>
      setTimeout(() => navigation.preload(tab), 800 + i * 250),
    );
    return () => timers.forEach(clearTimeout);
  }, [navigation]);

  const label = located
    ? area.name
    : locating
    ? 'Finding your location…'
    : 'Set your location';

  // The tab bar already covers the bottom safe area.
  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open menu"
          hitSlop={8}
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          style={({ pressed }) => [
            styles.iconButton,
            pressed && styles.pressed,
          ]}
        >
          <Icon name="menu" color={colors.textPrimary} size={22} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Location: ${label}. Use my current location`}
          accessibilityState={{ busy: locating }}
          hitSlop={8}
          disabled={locating}
          onPress={() => locate()}
          style={({ pressed }) => [styles.location, pressed && styles.pressed]}
        >
          <Icon name="mapPin" color={colors.accent} size={16} />
          <Text style={styles.locationText} numberOfLines={1}>
            {label}
          </Text>
          {locating ? (
            <ActivityIndicator size="small" color={colors.accent} />
          ) : (
            <Icon name="locate" color={colors.textSecondary} size={14} />
          )}
        </Pressable>
      </View>

      <View style={styles.searchRow}>
        <SearchField
          value={query}
          onChangeText={setQuery}
          placeholder="Search phones, sofas, shoes…"
        />
      </View>

      {!searching && (
        <ScrollView
          contentContainerStyle={styles.browse}
          showsVerticalScrollIndicator={false}
        >
          <PromoCarousel
            width={width}
            inset={PADDING}
            onPress={promo => navigation.navigate(promo.target)}
          />

          <View style={styles.padded}>
            <SectionHeader
              title="Shop by category"
              onSeeAll={() => navigation.navigate('Explore')}
            />
            {/* Four per row; the six categories make two rows. */}
            <View style={styles.categories}>
              {tiles.map(({ category, image }) => (
                <Pressable
                  key={category}
                  accessibilityRole="button"
                  accessibilityLabel={`Browse ${category}`}
                  onPress={() => navigation.navigate('Explore', { category })}
                  style={({ pressed }) => [
                    styles.category,
                    pressed && styles.pressed,
                  ]}
                >
                  <View style={styles.categoryCircle}>
                    {image ? (
                      <Image
                        source={{ uri: image }}
                        style={styles.categoryImage}
                        resizeMode="contain"
                      />
                    ) : (
                      <Text style={styles.categoryInitial}>
                        {category.charAt(0)}
                      </Text>
                    )}
                  </View>
                  <Text style={styles.categoryText} numberOfLines={1}>
                    {category}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {recommended.length > 0 && (
            <>
              <View style={styles.padded}>
                <SectionHeader
                  title="Recommended for you"
                  onSeeAll={() => navigation.navigate('Explore')}
                />
              </View>
              <FlatList
                horizontal
                data={recommended}
                keyExtractor={p => p.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.rail}
                renderItem={({ item }) => (
                  <RailCard
                    product={item}
                    caption={`★ ${item.sellerRating.toFixed(1)} · ${
                      item.location
                    }`}
                    onPress={() =>
                      navigation.navigate('Product', { productId: item.id })
                    }
                  />
                )}
              />
            </>
          )}

          {nearbyListings.length > 0 && (
            <View style={styles.padded}>
              <SectionHeader
                title="Nearby listings"
                onSeeAll={() => navigation.navigate('Explore')}
              />
              <View style={styles.cardGrid}>
                {nearbyListings.map(({ product, km }) => (
                  <RailCard
                    key={product.id}
                    product={product}
                    width={gridCardWidth}
                    caption={`${formatKm(km)} · ${product.location}`}
                    onPress={() =>
                      navigation.navigate('Product', { productId: product.id })
                    }
                  />
                ))}
              </View>
            </View>
          )}

          {dealListings.length > 0 && (
            <View style={styles.padded}>
              <SectionHeader
                title={`Under AED ${DEAL_LIMIT}`}
                onSeeAll={() => navigation.navigate('Explore')}
              />
              <View style={styles.cardGrid}>
                {dealListings.map(product => (
                  <RailCard
                    key={product.id}
                    product={product}
                    width={gridCardWidth}
                    caption={`${product.condition} · ${product.location}`}
                    onPress={() =>
                      navigation.navigate('Product', { productId: product.id })
                    }
                  />
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      )}

      {searching && (
        <FlatList
          data={results}
          keyExtractor={p => p.id}
          numColumns={2}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              width={cardWidth}
              onPress={() =>
                navigation.navigate('Product', { productId: item.id })
              }
            />
          )}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.results}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            results.length > 0 ? (
              <Text style={styles.resultCount}>
                {results.length} {results.length === 1 ? 'result' : 'results'}
              </Text>
            ) : undefined
          }
          ListEmptyComponent={
            !listings ? (
              error ? (
                <ErrorState error={error} onRetry={() => refetch()} />
              ) : (
                <LoadingState />
              )
            ) : (
              <EmptyState
                icon="explore"
                title="No items found"
                text={`Nothing matches "${query.trim()}".`}
              />
            )
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: PADDING,
    paddingTop: 16,
    paddingBottom: 8,
  },
  searchRow: {
    paddingHorizontal: PADDING,
    paddingTop: 8,
    paddingBottom: 12,
  },
  browse: {
    paddingBottom: 24,
  },
  padded: {
    paddingHorizontal: PADDING,
  },
  sectionHeader: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.textPrimary,
  },
  seeAll: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: colors.accentSoft,
  },
  seeAllText: {
    fontFamily: fonts.label,
    fontSize: 12,
    color: colors.textPrimary,
  },
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 18,
    marginTop: 16,
  },
  // A quarter of the row each, so a short last row stays in the columns.
  category: {
    width: '25%',
    alignItems: 'center',
    gap: 8,
  },
  categoryCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: palette.white,
    borderWidth: 2,
    borderColor: colors.accentSoft,
  },
  categoryImage: {
    width: 60,
    height: 60,
  },
  categoryInitial: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.accent,
  },
  categoryText: {
    fontFamily: fonts.label,
    fontSize: 13,
    color: colors.textPrimary,
  },
  rail: {
    gap: GAP,
    paddingHorizontal: PADDING,
    paddingTop: 16,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: GAP,
    rowGap: 16,
    marginTop: 16,
  },
  priceTag: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  priceTagText: {
    fontFamily: fonts.label,
    fontSize: 12,
    color: colors.onPrimary,
  },
  railTitle: {
    marginTop: 8,
    fontFamily: fonts.label,
    fontSize: 13,
    lineHeight: 17,
    color: colors.textPrimary,
  },
  railCaption: {
    marginTop: 2,
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textSecondary,
  },
  results: {
    flexGrow: 1,
    paddingHorizontal: PADDING,
    paddingBottom: 24,
    gap: GAP,
  },
  row: {
    gap: GAP,
  },
  resultCount: {
    fontFamily: fonts.label,
    fontSize: 13,
    color: colors.textSecondary,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  // Same height and rounding as the menu button, like the other tabs' title
  // pills. It shrinks to fit so long area names are cut off, not wrapped.
  location: {
    flexShrink: 1,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  locationText: {
    flexShrink: 1,
    fontFamily: fonts.label,
    fontSize: 14,
    color: colors.textPrimary,
  },
  pressed: {
    opacity: 0.7,
  },
});

export default HomeScreen;
