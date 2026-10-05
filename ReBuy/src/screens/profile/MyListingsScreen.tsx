import { FlatList, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProductCard from '../../components/product/ProductCard';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import LoadingState from '../../components/ui/LoadingState';
import ScreenHeader from '../../components/ui/ScreenHeader';
import { useAuth } from '../../context/AuthContext';
import { useMyListings } from '../../hooks/useListings';
import { usePullToRefresh } from '../../hooks/usePullToRefresh';
import type { RootStackScreenProps } from '../../navigation/types';
import { colors } from '../../theme';

const PADDING = 24;
const GAP = 12;

// Items the signed-in user has posted from the Sell tab, newest first.
function MyListingsScreen({ navigation }: RootStackScreenProps<'MyListings'>) {
  const { isSignedIn, signOut } = useAuth();
  const { width } = useWindowDimensions();
  const cardWidth = (width - PADDING * 2 - GAP) / 2;
  const { data: listings, error, refetch } = useMyListings();
  const { refreshing, onRefresh } = usePullToRefresh(refetch);

  const goToSell = () =>
    navigation.navigate('App', {
      screen: 'Tabs',
      params: { screen: 'Sell' },
    });

  const empty = !isSignedIn ? (
    <EmptyState
      icon="tag"
      title="Sign in to see your listings"
      text="Items you list for sale will appear here."
      actionTitle="Sign in"
      onAction={signOut}
    />
  ) : !listings ? (
    error ? (
      <ErrorState error={error} onRetry={() => refetch()} />
    ) : (
      <LoadingState />
    )
  ) : (
    <EmptyState
      icon="tag"
      title="No listings yet"
      text="Items you list for sale will appear here."
      actionTitle="List an item"
      onAction={goToSell}
    />
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <ScreenHeader
          title="My Listings"
          onBack={() => navigation.goBack()}
          pill
        />
      </View>
      <FlatList
        data={isSignedIn ? listings ?? [] : []}
        keyExtractor={p => p.id}
        numColumns={2}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            width={cardWidth}
            hideAddButton
            onPress={() =>
              navigation.navigate('Product', { productId: item.id })
            }
          />
        )}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={isSignedIn ? onRefresh : undefined}
        ListEmptyComponent={empty}
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

export default MyListingsScreen;
