import EmptyState from '../../components/ui/EmptyState';
import ScreenPlaceholder from '../../components/ui/ScreenPlaceholder';
import type { RootStackScreenProps } from '../../navigation/types';

// Empty until the Sell form saves listings.
function MyListingsScreen({ navigation }: RootStackScreenProps<'MyListings'>) {
  return (
    <ScreenPlaceholder
      title="My Listings"
      description="Items you're selling on ReBuy."
      onBack={() => navigation.goBack()}
    >
      <EmptyState
        icon="tag"
        title="No listings yet"
        text="Items you list for sale will appear here."
        actionTitle="List an item"
        onAction={() =>
          navigation.navigate('App', {
            screen: 'Tabs',
            params: { screen: 'Sell' },
          })
        }
      />
    </ScreenPlaceholder>
  );
}

export default MyListingsScreen;
