import EmptyState from '../../components/ui/EmptyState';
import ScreenPlaceholder from '../../components/ui/ScreenPlaceholder';
import type { RootStackScreenProps } from '../../navigation/types';

// Empty until checkout creates orders.
function OrdersScreen({ navigation }: RootStackScreenProps<'Orders'>) {
  return (
    <ScreenPlaceholder
      title="My Orders"
      description="Track items you've bought on ReBuy."
      onBack={() => navigation.goBack()}
    >
      <EmptyState
        icon="package"
        title="No orders yet"
        text="Items you buy will appear here."
        actionTitle="Start shopping"
        onAction={() =>
          navigation.navigate('App', {
            screen: 'Tabs',
            params: { screen: 'Home' },
          })
        }
      />
    </ScreenPlaceholder>
  );
}

export default OrdersScreen;
