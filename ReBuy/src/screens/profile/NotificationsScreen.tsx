import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import ScreenPlaceholder from '../../components/ui/ScreenPlaceholder';
import SettingSwitch from '../../components/ui/SettingSwitch';
import type { RootStackScreenProps } from '../../navigation/types';
import { colors } from '../../theme';

const OPTIONS = [
  {
    key: 'messages',
    label: 'Messages',
    description: 'When a buyer or seller sends you a message.',
  },
  {
    key: 'offers',
    label: 'Offers',
    description: 'When you get an offer, or yours is accepted.',
  },
  {
    key: 'priceDrops',
    label: 'Price drops',
    description: 'When a favourite item gets cheaper.',
  },
  {
    key: 'promotions',
    label: 'Deals and tips',
    description: 'Occasional news and offers from ReBuy.',
  },
] as const;

type Key = (typeof OPTIONS)[number]['key'];

// Kept in memory until there's a settings API and push notifications.
function NotificationsScreen({
  navigation,
}: RootStackScreenProps<'Notifications'>) {
  const [enabled, setEnabled] = useState<Record<Key, boolean>>({
    messages: true,
    offers: true,
    priceDrops: true,
    promotions: false,
  });

  return (
    <ScreenPlaceholder
      title="Notifications"
      description="Choose what you'd like to hear about."
      onBack={() => navigation.goBack()}
    >
      <View style={styles.card}>
        {OPTIONS.map((option, i) => (
          <SettingSwitch
            key={option.key}
            label={option.label}
            description={option.description}
            value={enabled[option.key]}
            onValueChange={value =>
              setEnabled(current => ({ ...current, [option.key]: value }))
            }
            last={i === OPTIONS.length - 1}
          />
        ))}
      </View>
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
});

export default NotificationsScreen;
