import { DrawerActions } from '@react-navigation/native';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import LocationSheet from '../../components/home/LocationSheet';
import ErrorState from '../../components/ui/ErrorState';
import Icon, { IconName } from '../../components/ui/Icon';
import LoadingState from '../../components/ui/LoadingState';
import { Area, distanceKm, findArea } from '../../data/areas';
import { useLocation } from '../../context/LocationContext';
import { CATEGORIES, Product } from '../../types/listing';
import { useFavorites } from '../../context/FavoritesContext';
import { useListings } from '../../hooks/useListings';
import type { TabScreenProps } from '../../navigation/types';
import { colors, fonts, palette, withAlpha } from '../../theme';
import { formatPrice } from '../../utils/format';

const PADDING = 20;
const GAP = 12;
const DEAL_LIMIT = 500;

type Promo = {
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
    title: `Great finds under\nAED ${DEAL_LIMIT}`,
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

function deals(listings: Product[]) {
  return listings
    .filter(p => p.price <= DEAL_LIMIT)
    .sort((a, b) => a.price - b.price);
}

const NEARBY_KM = 25;

// Listings within NEARBY_KM of `area`, closest first, with their distance.
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
    .sort((a, b) => a.km - b.km);
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

// Cover photo of the newest listing in each category, if any.
function categoryTiles(listings: Product[]) {
  return CATEGORIES.map(category => ({
    category,
    image: listings.find(p => p.category === category)?.images[0],
  }));
}

// `flush` drops the border and corners for photos inside a bordered card.
function Photo({
  uri,
  size,
  flush = false,
}: {
  uri?: string;
  size: number;
  flush?: boolean;
}) {
  return (
    <View
      style={[
        styles.photo,
        flush && styles.photoFlush,
        { width: size, height: size },
      ]}
    >
      {!!uri && (
        <Image
          source={{ uri }}
          style={StyleSheet.absoluteFill}
          resizeMode="contain"
        />
      )}
    </View>
  );
}

function HeartButton({ product }: { product: Product }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const saved = isFavorite(product.id);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        saved ? `Unsave ${product.title}` : `Save ${product.title}`
      }
      accessibilityState={{ selected: saved }}
      hitSlop={8}
      onPress={() => toggleFavorite(product.id)}
      style={({ pressed }) => [styles.heart, pressed && styles.pressed]}
    >
      <Icon
        name="heart"
        size={16}
        color={saved ? palette.red : colors.textPrimary}
        fill={saved ? palette.red : 'none'}
      />
    </Pressable>
  );
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

function PromoCarousel({
  width,
  onPress,
}: {
  width: number;
  onPress: (promo: Promo) => void;
}) {
  const [index, setIndex] = useState(0);
  const cardWidth = width - PADDING * 2;
  const step = cardWidth + GAP;

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const page = Math.round(e.nativeEvent.contentOffset.x / step);
    if (page !== index) {
      setIndex(page);
    }
  };

  return (
    <View>
      <FlatList
        horizontal
        data={PROMOS}
        keyExtractor={p => p.id}
        showsHorizontalScrollIndicator={false}
        snapToInterval={step}
        decelerationRate="fast"
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.promos}
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

// Compact card for the horizontal rails, with an optional line under the
// title.
function RailCard({
  product,
  caption,
  onPress,
}: {
  product: Product;
  caption?: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${product.title}, ${formatPrice(product.price)}`}
      onPress={onPress}
      style={({ pressed }) => [styles.deal, pressed && styles.pressed]}
    >
      <View>
        <Photo uri={product.images[0]} size={138} />
        <View style={styles.priceTag}>
          <Text style={styles.priceTagText}>{formatPrice(product.price)}</Text>
        </View>
      </View>
      <Text style={styles.dealTitle} numberOfLines={2}>
        {product.title}
      </Text>
      {!!caption && (
        <Text style={styles.dealCaption} numberOfLines={1}>
          {caption}
        </Text>
      )}
    </Pressable>
  );
}

function ListingTile({
  product,
  width,
  onPress,
}: {
  product: Product;
  width: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${product.title}, ${formatPrice(
        product.price,
      )}, posted ${product.postedAt}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.tile,
        { width },
        pressed && styles.pressed,
      ]}
    >
      <View>
        <Photo uri={product.images[0]} size={width - 2} flush />
        <View style={styles.newBadge}>
          <Text style={styles.newBadgeText}>{product.postedAt}</Text>
        </View>
        <HeartButton product={product} />
      </View>
      <View style={styles.tileBody}>
        <Text style={styles.tilePrice}>{formatPrice(product.price)}</Text>
        <Text style={styles.tileTitle} numberOfLines={1}>
          {product.title}
        </Text>
        <Text style={styles.tileMeta} numberOfLines={1}>
          <Text style={styles.star}>★ </Text>
          {product.sellerRating.toFixed(1)} · {product.location}
        </Text>
      </View>
    </Pressable>
  );
}

function HomeScreen({ navigation }: TabScreenProps<'Home'>) {
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const { ids: savedIds } = useFavorites();
  const { data, error, refetch, isRefetching } = useListings();
  const listings = useMemo(() => data ?? [], [data]);
  const recommended = useMemo(
    () => recommend(listings, savedIds),
    [listings, savedIds],
  );
  const dealListings = useMemo(() => deals(listings), [listings]);
  const tiles = useMemo(() => categoryTiles(listings), [listings]);
  const { area, setArea } = useLocation();
  const [locationOpen, setLocationOpen] = useState(false);
  const nearbyListings = useMemo(
    () => nearby(listings, area),
    [listings, area],
  );
  const firstName = user?.name.trim().split(/\s+/)[0];
  const tileWidth = (width - PADDING * 2 - GAP) / 2;

  const openProduct = (product: Product) =>
    navigation.navigate('Product', { productId: product.id });

  // The tab bar already covers the bottom safe area.
  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => {
              refetch();
            }}
            tintColor={colors.accent}
          />
        }
      >
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
          <View style={styles.hello}>
            <Text style={styles.helloName} numberOfLines={1}>
              Hi {firstName ?? 'there'} 👋
            </Text>
            <Text style={styles.helloSub}>What are you looking for?</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Location: ${area.name}. Change location`}
            hitSlop={8}
            onPress={() => setLocationOpen(true)}
            style={({ pressed }) => [
              styles.location,
              pressed && styles.pressed,
            ]}
          >
            <Icon name="mapPin" color={colors.accent} size={16} />
            <Text style={styles.locationText} numberOfLines={1}>
              {area.name}
            </Text>
            <Icon name="chevronDown" color={colors.textSecondary} size={14} />
          </Pressable>
        </View>

        <Pressable
          accessibilityRole="search"
          accessibilityLabel="Search items"
          onPress={() => navigation.navigate('Explore')}
          style={({ pressed }) => [styles.search, pressed && styles.pressed]}
        >
          <Icon name="explore" color={colors.textSecondary} size={20} />
          <Text style={styles.searchText}>Search phones, sofas, shoes…</Text>
        </Pressable>

        <PromoCarousel
          width={width}
          onPress={promo => navigation.navigate(promo.target)}
        />

        {!data ? (
          <View style={styles.padded}>
            {error ? (
              <ErrorState error={error} onRetry={() => refetch()} />
            ) : (
              <LoadingState />
            )}
          </View>
        ) : (
          <>
            <View style={styles.padded}>
              <SectionHeader
                title="Shop by category"
                onSeeAll={() => navigation.navigate('Explore')}
              />
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categories}
            >
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
                  <Text style={styles.categoryText}>{category}</Text>
                </Pressable>
              ))}
            </ScrollView>

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
                  caption={`★ ${item.sellerRating.toFixed(1)} · ${formatPrice(
                    item.price,
                  )}`}
                  onPress={() => openProduct(item)}
                />
              )}
            />

            {nearbyListings.length > 0 && (
              <>
                <View style={styles.padded}>
                  <SectionHeader
                    title="Nearby listings"
                    onSeeAll={() => navigation.navigate('Explore')}
                  />
                </View>
                <FlatList
                  horizontal
                  data={nearbyListings}
                  keyExtractor={({ product }) => product.id}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.rail}
                  renderItem={({ item: { product, km } }) => (
                    <RailCard
                      product={product}
                      caption={`${formatKm(km)} · ${product.location}`}
                      onPress={() => openProduct(product)}
                    />
                  )}
                />
              </>
            )}

            {dealListings.length > 0 && (
              <>
                <View style={styles.padded}>
                  <SectionHeader
                    title={`🔥 Under AED ${DEAL_LIMIT}`}
                    onSeeAll={() => navigation.navigate('Explore')}
                  />
                </View>
                <FlatList
                  horizontal
                  data={dealListings}
                  keyExtractor={p => p.id}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.rail}
                  renderItem={({ item }) => (
                    <RailCard
                      product={item}
                      onPress={() => openProduct(item)}
                    />
                  )}
                />
              </>
            )}

            <View style={styles.padded}>
              <SectionHeader
                title="✨ Just listed"
                onSeeAll={() => navigation.navigate('Explore')}
              />
              <View style={styles.grid}>
                {listings.slice(0, 6).map(product => (
                  <ListingTile
                    key={product.id}
                    product={product}
                    width={tileWidth}
                    onPress={() => openProduct(product)}
                  />
                ))}
              </View>
            </View>
          </>
        )}
      </ScrollView>

      <LocationSheet
        visible={locationOpen}
        selected={area}
        onSelect={setArea}
        onClose={() => setLocationOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingTop: 12,
    paddingBottom: 32,
  },
  padded: {
    paddingHorizontal: PADDING,
  },
  pressed: {
    opacity: 0.8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: PADDING,
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
  hello: {
    flex: 1,
  },
  helloName: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.textPrimary,
  },
  location: {
    maxWidth: 150,
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  locationText: {
    flexShrink: 1,
    fontFamily: fonts.label,
    fontSize: 12,
    color: colors.textPrimary,
  },
  helloSub: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textSecondary,
  },
  search: {
    height: 54,
    marginTop: 18,
    marginHorizontal: PADDING,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 18,
    borderRadius: 27,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: `0 6px 16px ${withAlpha(palette.ink, 0.08)}`,
  },
  searchText: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textSecondary,
  },
  promos: {
    gap: GAP,
    paddingHorizontal: PADDING,
    paddingTop: 20,
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
  sectionHeader: {
    marginTop: 28,
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
    gap: 16,
    paddingHorizontal: PADDING,
    paddingTop: 14,
  },
  category: {
    alignItems: 'center',
    gap: 8,
  },
  categoryCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: palette.white,
    borderWidth: 2,
    borderColor: colors.accentSoft,
  },
  categoryImage: {
    width: 56,
    height: 56,
  },
  categoryInitial: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.accent,
  },
  categoryText: {
    fontFamily: fonts.label,
    fontSize: 12,
    color: colors.textPrimary,
  },
  rail: {
    gap: GAP,
    paddingHorizontal: PADDING,
    paddingTop: 14,
  },
  deal: {
    width: 140,
  },
  photo: {
    overflow: 'hidden',
    borderRadius: 18,
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  photoFlush: {
    borderWidth: 0,
    borderRadius: 0,
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
  dealTitle: {
    marginTop: 8,
    fontFamily: fonts.label,
    fontSize: 13,
    lineHeight: 17,
    color: colors.textPrimary,
  },
  dealCaption: {
    marginTop: 2,
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textSecondary,
  },
  grid: {
    marginTop: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
  },
  tile: {
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  newBadge: {
    position: 'absolute',
    left: 8,
    top: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: withAlpha(palette.ink, 0.75),
  },
  newBadgeText: {
    fontFamily: fonts.label,
    fontSize: 10,
    color: colors.onPrimary,
  },
  tileBody: {
    padding: 10,
    gap: 2,
  },
  tilePrice: {
    fontFamily: fonts.display,
    fontSize: 16,
    color: colors.textPrimary,
  },
  tileTitle: {
    fontFamily: fonts.label,
    fontSize: 13,
    color: colors.textPrimary,
  },
  tileMeta: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textSecondary,
  },
  star: {
    color: colors.accent,
  },
  heart: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withAlpha(palette.white, 0.92),
    borderWidth: 1,
    borderColor: colors.border,
  },
});

export default HomeScreen;
