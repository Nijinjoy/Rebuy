import { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import TabScreen from '../../components/ui/TabScreen';
import BrowseSections from '../../components/explore/BrowseSections';
import Chip from '../../components/explore/Chip';
import FilterSheet from '../../components/explore/FilterSheet';
import PopularSearches from '../../components/explore/PopularSearches';
import SectionTitle from '../../components/explore/SectionTitle';
import SortSheet from '../../components/explore/SortSheet';
import ProductCard from '../../components/product/ProductCard';
import ErrorState from '../../components/ui/ErrorState';
import Icon from '../../components/ui/Icon';
import LoadingState from '../../components/ui/LoadingState';
import ScreenHeader from '../../components/ui/ScreenHeader';
import {
  countFilters,
  Filters,
  NO_FILTERS,
  searchListings,
  Sort,
  SORTS,
} from '../../utils/listingSearch';
import { CATEGORIES, Category, Product } from '../../types/listing';
import { useListings } from '../../hooks/useListings';
import { usePullToRefresh } from '../../hooks/usePullToRefresh';
import type { TabScreenProps } from '../../navigation/types';
import { colors, fonts } from '../../theme';

const PADDING = 24;
const GAP = 12;
// Categories shown before "View all": one row.
const CATEGORY_PREVIEW = 3;

// Cover photo of the newest listing and listing count for each category,
// busiest first (ties keep CATEGORIES' order).
function categoryTiles(listings: Product[]) {
  return CATEGORIES.map(category => {
    const inCategory = listings.filter(p => p.category === category);
    return {
      category,
      image: inCategory[0]?.images[0],
      count: inCategory.length,
    };
  }).sort((a, b) => b.count - a.count);
}

function CategoryTile({
  category,
  image,
  count,
  onPress,
}: {
  category: Category;
  image?: string;
  count: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${category}, ${count} ${
        count === 1 ? 'item' : 'items'
      }`}
      onPress={onPress}
      style={({ pressed }) => [styles.categoryTile, pressed && styles.pressed]}
    >
      <View style={styles.categoryImage}>
        {image ? (
          <Image
            source={{ uri: image }}
            style={StyleSheet.absoluteFill}
            resizeMode="contain"
          />
        ) : (
          <Text style={styles.categoryInitial}>{category.charAt(0)}</Text>
        )}
      </View>
      <Text style={styles.categoryName} numberOfLines={1}>
        {category}
      </Text>
      <Text style={styles.categoryCount}>
        {count} {count === 1 ? 'item' : 'items'}
      </Text>
    </Pressable>
  );
}

function ExploreScreen({ navigation, route }: TabScreenProps<'Explore'>) {
  const { width } = useWindowDimensions();
  const { params } = route;
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<Category | null>(
    params?.category ?? null,
  );
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  const [sort, setSort] = useState<Sort>('newest');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  // Home's category shortcuts navigate here with a new category.
  useEffect(() => {
    if (params?.category) {
      setCategory(params.category);
    }
  }, [params]);

  const cardWidth = (width - PADDING * 2 - GAP) / 2;

  const { data: listings, error, refetch } = useListings();
  const { refreshing, onRefresh } = usePullToRefresh(refetch);
  const tiles = useMemo(() => categoryTiles(listings ?? []), [listings]);
  const [allCategories, setAllCategories] = useState(false);
  const shownTiles = allCategories ? tiles : tiles.slice(0, CATEGORY_PREVIEW);
  const results = useMemo(
    () => searchListings(listings ?? [], { query, category, filters, sort }),
    [listings, query, category, filters, sort],
  );
  const countResults = (f: Filters) =>
    searchListings(listings ?? [], { query, category, filters: f, sort })
      .length;

  const filterCount = countFilters(filters);
  // With no search, category or filters, show just the category grid;
  // listings appear once the user searches, filters or picks a category.
  const browsing = !query.trim() && !category && filterCount === 0;

  const toolbar = (
    <View style={styles.toolbar}>
      <View style={styles.toolbarLeft}>
        <Text style={styles.count}>
          {results.length} {results.length === 1 ? 'item' : 'items'}
        </Text>
        {filterCount > 0 && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear filters"
            hitSlop={8}
            onPress={() => setFilters(NO_FILTERS)}
            style={({ pressed }) => pressed && styles.pressed}
          >
            <Text style={styles.clear}>Clear filters</Text>
          </Pressable>
        )}
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Sort by ${SORTS[sort]}. Change sort`}
        hitSlop={8}
        onPress={() => setSortOpen(true)}
        style={({ pressed }) => [styles.sortButton, pressed && styles.pressed]}
      >
        <Icon name="sort" color={colors.accent} size={14} />
        <Text style={styles.sort}>{SORTS[sort]}</Text>
      </Pressable>
    </View>
  );

  // The tab bar already covers the bottom safe area.
  return (
    <TabScreen style={styles.screen}>
      <View style={styles.header}>
        <ScreenHeader
          title={category ?? 'Explore'}
          onBack={category ? () => setCategory(null) : undefined}
          pill
        />
        <View style={styles.searchRow}>
          <View style={styles.search}>
            <Icon name="search" color={colors.placeholder} size={18} />
            <TextInput
              style={styles.searchInput}
              placeholder={
                category ? `Search in ${category}` : 'Search items or areas'
              }
              placeholderTextColor={colors.placeholder}
              value={query}
              onChangeText={setQuery}
              accessibilityLabel="Search items"
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              filterCount > 0 ? `Filters, ${filterCount} applied` : 'Filters'
            }
            onPress={() => setFiltersOpen(true)}
            style={({ pressed }) => [
              styles.filterButton,
              filterCount > 0 && styles.filterButtonActive,
              pressed && styles.pressed,
            ]}
          >
            <Icon
              name="filter"
              color={filterCount > 0 ? colors.onPrimary : colors.textPrimary}
              size={20}
            />
            {filterCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{filterCount}</Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>

      {browsing && (
        <PopularSearches
          listings={listings ?? []}
          inset={PADDING}
          onSearch={setQuery}
        />
      )}

      {!browsing && (
        <View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chips}
            accessibilityRole="tablist"
          >
            <Chip
              label="All"
              selected={!category}
              onPress={() => setCategory(null)}
            />
            {CATEGORIES.map(c => (
              <Chip
                key={c}
                label={c}
                selected={category === c}
                onPress={() => setCategory(c)}
              />
            ))}
          </ScrollView>
        </View>
      )}

      <FlatList
        data={browsing ? [] : results}
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
        contentContainerStyle={[styles.list, browsing && styles.listBrowsing]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          browsing ? (
            <View style={styles.browse}>
              <View>
                <SectionTitle
                  title="Categories"
                  action={
                    tiles.length > CATEGORY_PREVIEW
                      ? {
                          label: allCategories ? 'Show less' : 'View all',
                          onPress: () => setAllCategories(open => !open),
                        }
                      : undefined
                  }
                />
                <View style={styles.categoryGrid}>
                  {shownTiles.map(tile => (
                    <CategoryTile
                      key={tile.category}
                      {...tile}
                      onPress={() =>
                        navigation.navigate('Category', {
                          category: tile.category,
                        })
                      }
                    />
                  ))}
                </View>
              </View>
              <BrowseSections
                listings={listings ?? []}
                inset={PADDING}
                onFilter={setFilters}
              />
            </View>
          ) : (
            toolbar
          )
        }
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={
          !listings ? (
            error ? (
              <ErrorState error={error} onRetry={() => refetch()} />
            ) : (
              <LoadingState />
            )
          ) : browsing ? undefined : (
            <View style={styles.empty}>
              <Icon name="search" color={colors.placeholder} size={48} />
              <Text style={styles.emptyTitle}>No items found</Text>
              <Text style={styles.emptyText}>
                {filterCount > 0
                  ? 'Try removing some filters.'
                  : 'Try a different search or category.'}
              </Text>
            </View>
          )
        }
      />

      <FilterSheet
        visible={filtersOpen}
        filters={filters}
        countResults={countResults}
        onApply={setFilters}
        onClose={() => setFiltersOpen(false)}
      />
      <SortSheet
        visible={sortOpen}
        selected={sort}
        onSelect={setSort}
        onClose={() => setSortOpen(false)}
      />
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: PADDING,
    paddingTop: 16,
    gap: 16,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 10,
  },
  search: {
    flex: 1,
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textPrimary,
  },
  filterButton: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  filterButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
    backgroundColor: colors.accent,
  },
  badgeText: {
    fontFamily: fonts.label,
    fontSize: 10,
    color: colors.primary,
  },
  chips: {
    gap: 8,
    paddingHorizontal: PADDING,
    paddingVertical: 14,
  },
  pressed: {
    opacity: 0.7,
  },
  list: {
    flexGrow: 1,
    paddingHorizontal: PADDING,
    paddingBottom: 24,
    gap: GAP,
  },
  // Popular searches above already leaves a gap below it.
  listBrowsing: {
    paddingTop: 6,
  },
  row: {
    gap: GAP,
  },
  browse: {
    gap: 12,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
  },
  // Three per row, stretched to fill it. Sizing with flex rather than a
  // computed width avoids rounding pushing the third tile onto a new row.
  categoryTile: {
    flexGrow: 1,
    flexBasis: '30%',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  categoryImage: {
    width: 56,
    height: 56,
    marginBottom: 6,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 28,
    backgroundColor: colors.backgroundAlt,
  },
  categoryInitial: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.textPrimary,
  },
  categoryName: {
    fontFamily: fonts.label,
    fontSize: 13,
    color: colors.textPrimary,
  },
  categoryCount: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textSecondary,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toolbarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  count: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textSecondary,
  },
  clear: {
    fontFamily: fonts.label,
    fontSize: 12,
    color: colors.error,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sort: {
    fontFamily: fonts.label,
    fontSize: 12,
    color: colors.accent,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 48,
  },
  emptyTitle: {
    marginTop: 8,
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.textPrimary,
  },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: 14,
    textAlign: 'center',
    color: colors.textSecondary,
  },
});

export default ExploreScreen;
