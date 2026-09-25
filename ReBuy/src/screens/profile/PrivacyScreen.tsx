import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import Button from '../../components/ui/Button';
import ScreenPlaceholder from '../../components/ui/ScreenPlaceholder';
import SettingSwitch from '../../components/ui/SettingSwitch';
import type { RootStackScreenProps } from '../../navigation/types';
import { colors } from '../../theme';

// Kept in memory until there's a settings API.
function PrivacyScreen({ navigation }: RootStackScreenProps<'Privacy'>) {
  const [showPhone, setShowPhone] = useState(false);
  const [showOnline, setShowOnline] = useState(true);
  const [showArea, setShowArea] = useState(true);

  const handleDelete = () => {
    // Placeholder until the account API exists.
    Alert.alert('Delete account', 'Deleting your account is coming soon.');
  };

  return (
    <ScreenPlaceholder
      title="Privacy"
      description="Control what other people see about you."
      onBack={() => navigation.goBack()}
    >
      <View style={styles.card}>
        <SettingSwitch
          label="Show my phone number"
          description="Buyers can call you from your listings."
          value={showPhone}
          onValueChange={setShowPhone}
        />
        <SettingSwitch
          label="Show when I'm online"
          description="Others see when you were last active in chats."
          value={showOnline}
          onValueChange={setShowOnline}
        />
        <SettingSwitch
          label="Show my area on listings"
          description="Your exact address is never shown."
          value={showArea}
          onValueChange={setShowArea}
          last
        />
      </View>
      <Button
        title="Delete account"
        variant="outline"
        onPress={handleDelete}
        style={styles.delete}
      />
    </ScreenPlaceholder>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  delete: {
    marginTop: 24,
  },
});

export default PrivacyScreen;
