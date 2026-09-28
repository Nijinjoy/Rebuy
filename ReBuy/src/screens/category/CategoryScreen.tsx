import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProductCard from '../../components/product/ProductCard';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import LoadingState from '../../components/ui/LoadingState';
import ScreenHeader from '../../components/ui/ScreenHeader';
import SearchField from '../../components/ui/SearchField';
import { useListings } from '../../hooks/useListings';
import { usePullToRefresh } from '../../hooks/usePullToRefresh';
import type { RootStackScreenProps } from '../../navigation/types';
import { colors } from '../../theme';
import { NO_FILTERS, searchListings } from '../../utils/listingSearch';

const PADDING = 24;
const GAP = 12;

// Every listing in one category, newest first, with a search that stays
// within the category.
function CategoryScreen({
  navigation,
  route,
}: RootStackScreenProps<'Category'>) {
  const { category } = route.params;
  const { width } = useWindowDimensions();
  const cardWidth = (width - PADDING * 2 - GAP) / 2;
  const { data: listings, error, refetch } = useListings();
  const { refreshing, onRefresh } = usePullToRefresh(refetch);
  const [query, setQuery] = useState('');
  const searching = query.trim().length > 0;
  const products = useMemo(
    () =>
      searchListings(listings ?? [], {
        query,
        category,
        filters: NO_FILTERS,
        sort: 'newest',
      }),
    [listings, query, category],
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <ScreenHeader
          title={category}
          onBack={() => navigation.goBack()}
          pill
        />
      </View>
      <View style={styles.searchRow}>
        <SearchField
          value={query}
          onChangeText={setQuery}
          placeholder={`Search in ${category}`}
        />
      </View>
      <FlatList
        data={products}
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
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={
          !listings ? (
            error ? (
              <ErrorState error={error} onRetry={() => refetch()} />
            ) : (
              <LoadingState />
            )
          ) : (
            <EmptyState
              icon="search"
              title={searching ? 'No items found' : 'Nothing here yet'}
              text={
                searching
                  ? `Nothing in ${category} matches "${query.trim()}".`
                  : `No ${category} listings right now. Check back soon.`
              }
            />
          )
        }
      />
    </SafeAreaView>
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
    paddingBottom: 8,
  },
  searchRow: {
    paddingHorizontal: PADDING,
    paddingTop: 8,
    paddingBottom: 12,
  },
  list: {
    flexGrow: 1,
    paddingHorizontal: PADDING,
    paddingTop: 8,
    paddingBottom: 24,
    gap: GAP,
  },
  row: {
    gap: GAP,
  },
});

export default CategoryScreen;
