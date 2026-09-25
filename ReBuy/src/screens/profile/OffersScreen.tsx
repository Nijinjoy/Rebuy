import EmptyState from '../../components/ui/EmptyState';
import ScreenPlaceholder from '../../components/ui/ScreenPlaceholder';
import type { RootStackScreenProps } from '../../navigation/types';

// Empty until offers can be made on listings.
function OffersScreen({ navigation }: RootStackScreenProps<'Offers'>) {
  return (
    <ScreenPlaceholder
      title="Offers"
      description="Offers you've made and received."
      onBack={() => navigation.goBack()}
    >
      <EmptyState
        icon="percent"
        title="No offers yet"
        text="Make an offer from a chat with a seller and it will appear here."
        actionTitle="Open chats"
        onAction={() =>
          navigation.navigate('App', {
            screen: 'Tabs',
            params: { screen: 'Chats' },
          })
        }
      />
    </ScreenPlaceholder>
  );
}

export default OffersScreen;
