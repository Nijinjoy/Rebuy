import { showAlert } from '../../components/ui/AlertProvider';
import EmptyState from '../../components/ui/EmptyState';
import ScreenPlaceholder from '../../components/ui/ScreenPlaceholder';
import type { RootStackScreenProps } from '../../navigation/types';

function AddressesScreen({ navigation }: RootStackScreenProps<'Addresses'>) {
  const handleAdd = () => {
    // Placeholder until saved addresses are built.
    showAlert('Add address', 'Saving addresses is coming soon.');
  };

  return (
    <ScreenPlaceholder
      title="Addresses"
      description="Where your orders are delivered."
      onBack={() => navigation.goBack()}
    >
      <EmptyState
        icon="mapPin"
        title="No saved addresses"
        text="Add an address to speed up checkout."
        actionTitle="Add address"
        onAction={handleAdd}
      />
    </ScreenPlaceholder>
  );
}

export default AddressesScreen;
