import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AREAS } from '../../data/areas';
import { Filters, NO_FILTERS, RATINGS } from '../../utils/listingSearch';
import { Condition, CONDITIONS } from '../../types/listing';
import { colors, fonts } from '../../theme';
import Button from '../ui/Button';
import Icon from '../ui/Icon';
import Chip from './Chip';

type PriceRange = { label: string; min: number | null; max: number | null };

const PRICE_RANGES: PriceRange[] = [
  { label: 'Under AED 500', min: null, max: 500 },
  { label: 'AED 500 – 2,000', min: 500, max: 2000 },
  { label: 'Over AED 2,000', min: 2000, max: null },
];

type Props = {
  visible: boolean;
  filters: Filters;
  // Number of listings the given filters would show, for the Apply button.
  countResults: (filters: Filters) => number;
  onApply: (filters: Filters) => void;
  onClose: () => void;
};

const toText = (n: number | null) => (n === null ? '' : String(n));

function parsePrice(text: string) {
  const n = parseInt(text.replace(/[^0-9]/g, ''), 10);
  return Number.isNaN(n) ? null : n;
}

function toggle<T>(list: T[], item: T) {
  return list.includes(item) ? list.filter(i => i !== item) : [...list, item];
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle} accessibilityRole="header">
        {title}
      </Text>
      {children}
    </View>
  );
}

// Bottom sheet for narrowing listings by price, condition, location and
// seller rating. Changes are kept as a draft until the user taps Apply.
function FilterSheet({
  visible,
  filters,
  countResults,
  onApply,
  onClose,
}: Props) {
  const [draft, setDraft] = useState(filters);
  const [minText, setMinText] = useState(toText(filters.minPrice));
  const [maxText, setMaxText] = useState(toText(filters.maxPrice));

  // Start from the applied filters each time the sheet opens.
  useEffect(() => {
    if (visible) {
      setDraft(filters);
      setMinText(toText(filters.minPrice));
      setMaxText(toText(filters.maxPrice));
    }
  }, [visible, filters]);

  const result: Filters = {
    ...draft,
    minPrice: parsePrice(minText),
    maxPrice: parsePrice(maxText),
  };
  const count = countResults(result);

  const setRange = (range: PriceRange) => {
    const isSelected =
      result.minPrice === range.min && result.maxPrice === range.max;
    setMinText(isSelected ? '' : toText(range.min));
    setMaxText(isSelected ? '' : toText(range.max));
  };

  const reset = () => {
    setDraft(NO_FILTERS);
    setMinText('');
    setMaxText('');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable
        accessibilityLabel="Close filters"
        style={styles.backdrop}
        onPress={onClose}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.sheetWrap}
      >
        <SafeAreaView style={styles.sheet} edges={['bottom']}>
          <View style={styles.header}>
            <Text style={styles.title} accessibilityRole="header">
              Filters
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close filters"
              hitSlop={8}
              onPress={onClose}
              style={({ pressed }) => pressed && styles.pressed}
            >
              <Icon name="close" color={colors.textPrimary} size={22} />
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={styles.body}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Section title="Price (AED)">
              <View style={styles.priceRow}>
                <TextInput
                  style={styles.priceInput}
                  placeholder="Min"
                  placeholderTextColor={colors.placeholder}
                  keyboardType="number-pad"
                  value={minText}
                  onChangeText={setMinText}
                  accessibilityLabel="Minimum price"
                />
                <Text style={styles.priceDash}>–</Text>
                <TextInput
                  style={styles.priceInput}
                  placeholder="Max"
                  placeholderTextColor={colors.placeholder}
                  keyboardType="number-pad"
                  value={maxText}
                  onChangeText={setMaxText}
                  accessibilityLabel="Maximum price"
                />
              </View>
              <View style={styles.chips}>
                {PRICE_RANGES.map(range => (
                  <Chip
                    key={range.label}
                    role="radio"
                    label={range.label}
                    selected={
                      result.minPrice === range.min &&
                      result.maxPrice === range.max
                    }
                    onPress={() => setRange(range)}
                  />
                ))}
              </View>
            </Section>

            <Section title="Condition">
              <View style={styles.chips}>
                {CONDITIONS.map((condition: Condition) => (
                  <Chip
                    key={condition}
                    role="checkbox"
                    label={condition}
                    selected={draft.conditions.includes(condition)}
                    onPress={() =>
                      setDraft(d => ({
                        ...d,
                        conditions: toggle(d.conditions, condition),
                      }))
                    }
                  />
                ))}
              </View>
            </Section>

            <Section title="Location">
              <View style={styles.chips}>
                {AREAS.map(({ name }) => (
                  <Chip
                    key={name}
                    role="checkbox"
                    label={name}
                    selected={draft.locations.includes(name)}
                    onPress={() =>
                      setDraft(d => ({
                        ...d,
                        locations: toggle(d.locations, name),
                      }))
                    }
                  />
                ))}
              </View>
            </Section>

            <Section title="Seller rating">
              <View style={styles.chips}>
                <Chip
                  role="radio"
                  label="Any"
                  selected={draft.minRating === null}
                  onPress={() => setDraft(d => ({ ...d, minRating: null }))}
                />
                {RATINGS.map(rating => (
                  <Chip
                    key={rating}
                    role="radio"
                    label={`★ ${rating}+`}
                    selected={draft.minRating === rating}
                    onPress={() => setDraft(d => ({ ...d, minRating: rating }))}
                  />
                ))}
              </View>
            </Section>
          </ScrollView>

          <View style={styles.footer}>
            <Button
              title="Reset"
              variant="outline"
              onPress={reset}
              style={styles.reset}
            />
            <Button
              title={`Show ${count} ${count === 1 ? 'item' : 'items'}`}
              onPress={() => {
                onApply(result);
                onClose();
              }}
              style={styles.apply}
            />
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.shadow,
  },
  sheetWrap: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '85%',
    paddingTop: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.textPrimary,
  },
  body: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    gap: 20,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontFamily: fonts.label,
    fontSize: 13,
    color: colors.textPrimary,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  priceInput: {
    flex: 1,
    height: 44,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textPrimary,
  },
  priceDash: {
    fontFamily: fonts.body,
    color: colors.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  reset: {
    flex: 1,
  },
  apply: {
    flex: 2,
  },
  pressed: {
    opacity: 0.7,
  },
});

export default FilterSheet;
