import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import Button from '../../components/ui/Button';
import Icon from '../../components/ui/Icon';
import ScreenPlaceholder from '../../components/ui/ScreenPlaceholder';
import type { RootStackScreenProps } from '../../navigation/types';
import { colors, fonts } from '../../theme';

const FAQS = [
  {
    question: 'How do I sell an item?',
    answer:
      'Open the Sell tab, choose whether you sell as an individual or a company, then add photos, a title, price and location.',
  },
  {
    question: 'How do I contact a seller?',
    answer:
      'Open a listing and tap Chat with seller. Your conversations are in the Chats tab.',
  },
  {
    question: 'Is it safe to meet a buyer or seller?',
    answer:
      'Meet in a busy public place, check the item before you pay, and never send money in advance.',
  },
  {
    question: 'How do I change my location?',
    answer:
      'Tap the location at the top of the Home tab, or Location in the menu, and pick your area.',
  },
];

function HelpScreen({ navigation }: RootStackScreenProps<'Help'>) {
  const [open, setOpen] = useState<number | null>(null);

  const handleContact = () => {
    // Placeholder until there's a support inbox.
    Alert.alert('Contact support', 'Support chat is coming soon.');
  };

  return (
    <ScreenPlaceholder
      title="Help & Support"
      description="Answers to common questions."
      onBack={() => navigation.goBack()}
    >
      <View style={styles.card}>
        {FAQS.map((faq, i) => {
          const expanded = open === i;
          return (
            <Pressable
              key={faq.question}
              accessibilityRole="button"
              accessibilityState={{ expanded }}
              onPress={() => setOpen(expanded ? null : i)}
              style={[styles.faq, i < FAQS.length - 1 && styles.divider]}
            >
              <View style={styles.questionRow}>
                <Text style={styles.question}>{faq.question}</Text>
                <Icon
                  name={expanded ? 'minus' : 'plus'}
                  color={colors.textSecondary}
                  size={16}
                />
              </View>
              {expanded && <Text style={styles.answer}>{faq.answer}</Text>}
            </Pressable>
          );
        })}
      </View>
      <Button
        title="Contact support"
        onPress={handleContact}
        style={styles.contact}
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
  faq: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 8,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  question: {
    flex: 1,
    fontFamily: fonts.label,
    fontSize: 14,
    color: colors.textPrimary,
  },
  answer: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
  },
  contact: {
    marginTop: 24,
  },
});

export default HelpScreen;
