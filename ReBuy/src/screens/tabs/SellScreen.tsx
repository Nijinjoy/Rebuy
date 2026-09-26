import { ReactNode, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInputInstance,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SellerTypePicker, {
  SELLER_TYPES,
} from '../../components/sell/SellerTypePicker';
import Button from '../../components/ui/Button';
import Icon from '../../components/ui/Icon';
import ScreenHeader from '../../components/ui/ScreenHeader';
import TextField from '../../components/ui/TextField';
import { SellerType, useSeller } from '../../context/SellerContext';
import { CATEGORIES, Category, Product } from '../../types/listing';
import { colors, fonts } from '../../theme';
import { formatPrice } from '../../utils/format';

const CONDITIONS: Product['condition'][] = ['Like new', 'Very good', 'Good'];
const PHOTO_SLOTS = 4;

type Values = {
  title: string;
  category: Category | null;
  condition: Product['condition'] | null;
  price: string;
  location: string;
  description: string;
};

type Errors = Partial<Record<keyof Values, string>>;

const EMPTY: Values = {
  title: '',
  category: null,
  condition: null,
  price: '',
  location: '',
  description: '',
};

function validate(values: Values): Errors {
  const errors: Errors = {};

  if (!values.title.trim()) {
    errors.title = 'Give your item a title.';
  }
  if (!values.category) {
    errors.category = 'Choose a category.';
  }
  if (!values.condition) {
    errors.condition = 'Choose a condition.';
  }
  if (!(Number(values.price) > 0)) {
    errors.price = 'Enter a price above 0.';
  }
  if (!values.location.trim()) {
    errors.location = 'Enter where the item is.';
  }

  return errors;
}

type ChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

function Chip({ label, selected, onPress }: ChipProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.chipSelected,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

type SectionProps = {
  label: string;
  error?: string;
  children: ReactNode;
};

function Section({ label, error, children }: SectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{label}</Text>
      {children}
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

function ListingForm({ sellerType }: { sellerType: SellerType }) {
  const { setSellerType } = useSeller();
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const priceRef = useRef<TextInputInstance>(null);
  const locationRef = useRef<TextInputInstance>(null);
  const descriptionRef = useRef<TextInputInstance>(null);

  // After the first submit attempt, re-validate as the user types.
  const update = <K extends keyof Values>(key: K, value: Values[K]) => {
    const next = { ...values, [key]: value };
    setValues(next);
    if (submitted) {
      setErrors(validate(next));
    }
  };

  const handleAddPhoto = () => {
    Alert.alert('Add photos', 'Photo upload is coming soon.');
  };

  const handlePost = () => {
    const found = validate(values);
    setSubmitted(true);
    setErrors(found);
    if (Object.values(found).some(Boolean)) {
      return;
    }

    // No listings API yet, so just confirm and clear the form.
    Alert.alert(
      'Listing posted',
      `${values.title.trim()} for ${formatPrice(Number(values.price))}`,
    );
    setValues(EMPTY);
    setErrors({});
    setSubmitted(false);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <ScreenHeader title="Sell" pill />
          <Text style={styles.description}>
            List a pre-owned item for sale.
          </Text>

          <View style={styles.sellerType}>
            <Icon
              name={SELLER_TYPES[sellerType].icon}
              color={colors.textPrimary}
              size={16}
            />
            <Text style={styles.sellerTypeText}>
              Selling as {SELLER_TYPES[sellerType].title}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Change seller type"
              hitSlop={8}
              onPress={() => setSellerType(null)}
              style={({ pressed }) => pressed && styles.pressed}
            >
              <Text style={styles.sellerTypeChange}>Change</Text>
            </Pressable>
          </View>

          <Section label="Photos">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.photos}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Add photos"
                onPress={handleAddPhoto}
                style={({ pressed }) => [
                  styles.photo,
                  styles.addPhoto,
                  pressed && styles.pressed,
                ]}
              >
                <Icon name="camera" color={colors.accent} size={26} />
                <Text style={styles.addPhotoText}>Add photos</Text>
              </Pressable>
              {Array.from({ length: PHOTO_SLOTS }, (_, i) => (
                <View key={i} style={[styles.photo, styles.emptyPhoto]} />
              ))}
            </ScrollView>
            <Text style={styles.hint}>
              Add up to 5 photos. The first one is the cover.
            </Text>
          </Section>

          <View style={styles.fields}>
            <TextField
              label="Title"
              placeholder="e.g. iPhone 15 Pro, 256 GB"
              value={values.title}
              onChangeText={text => update('title', text)}
              error={errors.title}
              maxLength={80}
              returnKeyType="next"
              onSubmitEditing={() => priceRef.current?.focus()}
            />

            <Section label="Category" error={errors.category}>
              <View style={styles.chips} accessibilityRole="radiogroup">
                {CATEGORIES.map(category => (
                  <Chip
                    key={category}
                    label={category}
                    selected={values.category === category}
                    onPress={() => update('category', category)}
                  />
                ))}
              </View>
            </Section>

            <Section label="Condition" error={errors.condition}>
              <View style={styles.chips} accessibilityRole="radiogroup">
                {CONDITIONS.map(condition => (
                  <Chip
                    key={condition}
                    label={condition}
                    selected={values.condition === condition}
                    onPress={() => update('condition', condition)}
                  />
                ))}
              </View>
            </Section>

            <TextField
              ref={priceRef}
              label="Price (AED)"
              placeholder="0"
              value={values.price}
              onChangeText={text => update('price', text.replace(/\D/g, ''))}
              error={errors.price}
              keyboardType="number-pad"
              maxLength={7}
              returnKeyType="next"
              onSubmitEditing={() => locationRef.current?.focus()}
            />

            <TextField
              ref={locationRef}
              label="Location"
              placeholder="e.g. Dubai Marina"
              value={values.location}
              onChangeText={text => update('location', text)}
              error={errors.location}
              returnKeyType="next"
              onSubmitEditing={() => descriptionRef.current?.focus()}
            />

            <TextField
              ref={descriptionRef}
              label="Description (optional)"
              placeholder="Age, what's included, any flaws…"
              value={values.description}
              onChangeText={text => update('description', text)}
              multiline
              maxLength={1000}
            />
          </View>

          <Button
            title="Post listing"
            onPress={handlePost}
            style={styles.submit}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Asks for the seller type first, then shows the listing form.
function SellScreen() {
  const { sellerType } = useSeller();

  return sellerType ? (
    <ListingForm sellerType={sellerType} />
  ) : (
    <SellerTypePicker />
  );
}

const styles = StyleSheet.create({
  sellerType: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.accentTint,
    borderWidth: 1,
    borderColor: colors.accentSoft,
  },
  sellerTypeText: {
    flex: 1,
    fontFamily: fonts.label,
    fontSize: 13,
    color: colors.textPrimary,
  },
  sellerTypeChange: {
    fontFamily: fonts.label,
    fontSize: 13,
    color: colors.accent,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
  },
  description: {
    marginTop: 16,
    marginBottom: 16,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  section: {
    gap: 8,
  },
  sectionLabel: {
    fontFamily: fonts.label,
    fontSize: 13,
    color: colors.textPrimary,
  },
  photos: {
    gap: 10,
  },
  photo: {
    width: 96,
    height: 96,
    borderRadius: 14,
  },
  addPhoto: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.accent,
    backgroundColor: colors.accentTint,
  },
  addPhotoText: {
    fontFamily: fonts.label,
    fontSize: 12,
    color: colors.accent,
  },
  emptyPhoto: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  hint: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textSecondary,
  },
  fields: {
    marginTop: 24,
    gap: 20,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  chipText: {
    fontFamily: fonts.label,
    fontSize: 13,
    color: colors.textPrimary,
  },
  chipTextSelected: {
    color: colors.onPrimary,
  },
  pressed: {
    opacity: 0.7,
  },
  error: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.error,
  },
  submit: {
    marginTop: 32,
  },
});

export default SellScreen;
