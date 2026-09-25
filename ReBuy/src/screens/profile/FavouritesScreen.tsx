import {
  FlatList,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFavorites } from '../../context/FavoritesContext';
import Button from '../../components/ui/Button';
import Icon from '../../components/ui/Icon';
import ProductCard from '../../components/product/ProductCard';
import ScreenHeader from '../../components/ui/ScreenHeader';
import ErrorState from '../../components/ui/ErrorState';
import LoadingState from '../../components/ui/LoadingState';
import { useListings } from '../../hooks/useListings';
import type { RootStackScreenProps } from '../../navigation/types';
import { colors, fonts } from '../../theme';

const PADDING = 24;
const GAP = 12;

function FavouritesScreen({ navigation }: RootStackScreenProps<'Favourites'>) {
  const { width } = useWindowDimensions();
  const { ids } = useFavorites();
  const cardWidth = (width - PADDING * 2 - GAP) / 2;
  const { data: listings, error, refetch } = useListings();
  const saved = listings?.filter(p => ids.includes(p.id)) ?? [];

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <ScreenHeader title="Favourites" onBack={() => navigation.goBack()} />
      </View>
      <FlatList
        data={saved}
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
        ListEmptyComponent={
          !listings ? (
            error ? (
              <ErrorState error={error} onRetry={() => refetch()} />
            ) : (
              <LoadingState />
            )
          ) : (
            <View style={styles.empty}>
              <Icon name="heart" color={colors.placeholder} size={48} />
              <Text style={styles.emptyTitle}>No favourites yet</Text>
              <Text style={styles.emptyText}>
                Tap the heart on a listing to save it here.
              </Text>
              <Button
                title="Browse items"
                onPress={() =>
                  navigation.navigate('App', {
                    screen: 'Tabs',
                    params: { screen: 'Home' },
                  })
                }
                style={styles.emptyButton}
              />
            </View>
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
  list: {
    flexGrow: 1,
    padding: PADDING,
    gap: GAP,
  },
  row: {
    gap: GAP,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyTitle: {
    marginTop: 8,
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.textPrimary,
  },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  emptyButton: {
    marginTop: 16,
    alignSelf: 'stretch',
  },
});

export default FavouritesScreen;
