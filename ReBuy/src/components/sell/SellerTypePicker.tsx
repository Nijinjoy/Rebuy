import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SellerType, useSeller } from '../../context/SellerContext';
import { colors, fonts } from '../../theme';
import Icon, { IconName } from '../ui/Icon';
import ScreenPlaceholder from '../ui/ScreenPlaceholder';

export const SELLER_TYPES: Record<
  SellerType,
  { icon: IconName; title: string; text: string }
> = {
  individual: {
    icon: 'profile',
    title: 'Individual',
    text: 'Sell your personal items',
  },
  company: {
    icon: 'building',
    title: 'Company',
    text: 'Sell as a business',
  },
};

// First step of the Sell tab: asks what type of seller the user is.
function SellerTypePicker() {
  const { setSellerType } = useSeller();

  return (
    <ScreenPlaceholder
      title="Start selling"
      description="What type of seller are you?"
    >
      <View style={styles.options} accessibilityRole="radiogroup">
        {(Object.keys(SELLER_TYPES) as SellerType[]).map(type => {
          const option = SELLER_TYPES[type];
          return (
            <Pressable
              key={type}
              accessibilityRole="radio"
              accessibilityState={{ selected: false }}
              accessibilityLabel={`${option.title}. ${option.text}`}
              onPress={() => setSellerType(type)}
              style={({ pressed }) => [styles.card, pressed && styles.pressed]}
            >
              <View style={styles.icon}>
                <Icon name={option.icon} color={colors.textPrimary} size={24} />
              </View>
              <View style={styles.text}>
                <Text style={styles.title}>{option.title}</Text>
                <Text style={styles.body}>{option.text}</Text>
              </View>
              <Icon name="chevronRight" color={colors.placeholder} size={20} />
            </Pressable>
          );
        })}
      </View>
    </ScreenPlaceholder>
  );
}

const styles = StyleSheet.create({
  options: {
    gap: 14,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  pressed: {
    borderColor: colors.accent,
    backgroundColor: colors.accentTint,
  },
  icon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentSoft,
  },
  text: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 17,
    color: colors.textPrimary,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textSecondary,
  },
});

export default SellerTypePicker;
