import { ReactNode, useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  ScrollViewInstance,
  StyleSheet,
  Text,
  TextInputInstance,
  View,
} from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { showAlert } from '../../components/ui/AlertProvider';
import TabScreen from '../../components/ui/TabScreen';
import CategoryPicker from '../../components/sell/CategoryPicker';
import ConditionPicker from '../../components/sell/ConditionPicker';
import MapLocationPicker from '../../components/sell/MapLocationPicker';
import PhotoPicker from '../../components/sell/PhotoPicker';
import Button from '../../components/ui/Button';
import Icon from '../../components/ui/Icon';
import ScreenHeader from '../../components/ui/ScreenHeader';
import TextField from '../../components/ui/TextField';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import { useCategories } from '../../hooks/useCategories';
import type { Area } from '../../data/areas';
import { useCreateListing } from '../../hooks/useListings';
import type { RootStackParamList } from '../../navigation/types';
import {
  ListingPhoto,
  MAX_LISTING_PHOTOS,
} from '../../services/api/listings/listingService';
import { Category, Product } from '../../types/listing';
import { colors, fonts } from '../../theme';
import { formatPrice } from '../../utils/format';

type Values = {
  title: string;
  category: Category | null;
  condition: Product['condition'] | null;
  price: string;
  location: string;
  description: string;
};

type Errors = Partial<Record<keyof Values | 'photos', string>>;

const EMPTY: Values = {
  title: '',
  category: null,
  condition: null,
  price: '',
  location: '',
  description: '',
};

function validate(values: Values, photos: ListingPhoto[]): Errors {
  const errors: Errors = {};

  if (photos.length === 0) {
    errors.photos = 'Add at least one photo.';
  }
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
    errors.location = 'Choose where the item is.';
  }

  return errors;
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

function SellScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { isSignedIn, signOut } = useAuth();
  const { area, located } = useLocation();
  const createListing = useCreateListing();
  const { categories } = useCategories();
  // Starts with the user's area when we know it.
  const initialValues = (): Values => ({
    ...EMPTY,
    location: located ? area.name : '',
  });
  const [values, setValues] = useState<Values>(initialValues);
  const [photos, setPhotos] = useState<ListingPhoto[]>([]);
  // Set when the seller picks the item's location on the map.
  const [pickedArea, setPickedArea] = useState<Area | null>(null);
  const [locationOpen, setLocationOpen] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  // 0–1 while the listing and its photos upload.
  const [progress, setProgress] = useState<number | null>(null);
  const posting = createListing.isPending;

  // GPS often finishes after the form opens; fill the location in then,
  // unless the user has already chosen one.
  useEffect(() => {
    if (located) {
      setValues(current =>
        current.location ? current : { ...current, location: area.name },
      );
    }
  }, [located, area.name]);
  const priceRef = useRef<TextInputInstance>(null);
  const descriptionRef = useRef<TextInputInstance>(null);
  const scrollRef = useRef<ScrollViewInstance>(null);
  const descriptionFocused = useRef(false);

  // Description is the last field: once the keyboard is up, scroll to the
  // bottom so the whole box and the Post button sit above the keyboard.
  useEffect(() => {
    const subscription = Keyboard.addListener('keyboardDidShow', () => {
      if (descriptionFocused.current) {
        scrollRef.current?.scrollToEnd({ animated: true });
      }
    });
    return () => subscription.remove();
  }, []);

  // After the first submit attempt, re-validate as the user types.
  const update = <K extends keyof Values>(key: K, value: Values[K]) => {
    const next = { ...values, [key]: value };
    setValues(next);
    if (submitted) {
      setErrors(validate(next, photos));
    }
  };

  const updatePhotos = (next: ListingPhoto[]) => {
    setPhotos(next);
    if (submitted) {
      setErrors(validate(values, next));
    }
  };

  const resetForm = () => {
    setValues(initialValues());
    setPickedArea(null);
    setPhotos([]);
    setErrors({});
    setSubmitted(false);
  };

  const handlePost = async () => {
    // Guests browse without an account; posting needs one.
    if (!isSignedIn) {
      showAlert(
        'Sign in to sell',
        'Create an account or sign in to post your listing.',
        [
          { text: 'Not now', style: 'cancel' },
          { text: 'Sign in', onPress: signOut },
        ],
        { icon: 'profile' },
      );
      return;
    }

    const found = validate(values, photos);
    setSubmitted(true);
    setErrors(found);
    if (Object.values(found).some(Boolean)) {
      return;
    }

    const location = values.location.trim();
    // The picked area, or the user's own area when that was filled in.
    const itemArea = pickedArea ?? (located ? area : null);
    setProgress(0);
    try {
      const product = await createListing.mutateAsync({
        listing: {
          title: values.title.trim(),
          category: values.category!,
          condition: values.condition!,
          price: Number(values.price),
          location,
          description: values.description.trim(),
          coords: itemArea
            ? { lat: itemArea.lat, lng: itemArea.lng }
            : undefined,
        },
        photos,
        onProgress: setProgress,
      });
      resetForm();
      showAlert(
        'Listing posted',
        `${product.title} for ${formatPrice(product.price)} is now live.`,
        [
          { text: 'Done', style: 'cancel' },
          {
            text: 'View listing',
            onPress: () =>
              navigation.navigate('Product', { productId: product.id }),
          },
        ],
        { icon: 'tag', tone: 'success' },
      );
    } catch (error) {
      if (__DEV__) {
        console.log(
          'Create listing error:',
          axios.isAxiosError(error)
            ? error.response?.status ?? error.message
            : error,
          axios.isAxiosError(error) ? error.response?.data : undefined,
        );
      }
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message
        : undefined;
      showAlert(
        "Couldn't post listing",
        message ?? 'Please check your connection and try again.',
      );
    } finally {
      setProgress(null);
    }
  };

  return (
    <TabScreen style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        // Android too: with edge-to-edge on, adjustResize no longer
        // shrinks the screen for the keyboard.
        behavior="padding"
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <ScreenHeader title="Sell" pill />
          <Text style={styles.description}>
            List a pre-owned item for sale.
          </Text>

          <View style={styles.titleField}>
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
          </View>

          <Section label={`Photos · ${photos.length}/${MAX_LISTING_PHOTOS}`}>
            <PhotoPicker
              photos={photos}
              onChange={updatePhotos}
              max={MAX_LISTING_PHOTOS}
              disabled={posting}
              error={errors.photos}
            />
          </Section>

          <View style={styles.fields}>
            <Section label="Category" error={errors.category}>
              <CategoryPicker
                categories={categories}
                selected={values.category}
                onSelect={category => update('category', category)}
                disabled={posting}
              />
            </Section>

            <Section label="Condition" error={errors.condition}>
              <ConditionPicker
                selected={values.condition}
                onSelect={condition => update('condition', condition)}
                disabled={posting}
              />
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
            />

            <Section label="Location" error={errors.location}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                  values.location
                    ? `Location, ${values.location}`
                    : 'Choose location'
                }
                disabled={posting}
                onPress={() => {
                  Keyboard.dismiss();
                  setLocationOpen(true);
                }}
                style={({ pressed }) => [
                  styles.locationField,
                  !!errors.location && styles.locationFieldError,
                  pressed && styles.pressed,
                ]}
              >
                <Icon name="mapPin" color={colors.accent} size={18} />
                <Text
                  style={[
                    styles.locationText,
                    !values.location && styles.locationPlaceholder,
                  ]}
                  numberOfLines={1}
                >
                  {values.location || 'Choose location'}
                </Text>
                <Icon name="chevronDown" color={colors.placeholder} size={18} />
              </Pressable>
            </Section>

            <TextField
              ref={descriptionRef}
              label="Description (optional)"
              placeholder="Age, what's included, any flaws…"
              value={values.description}
              onChangeText={text => update('description', text)}
              multiline
              maxLength={1000}
              onFocus={() => {
                descriptionFocused.current = true;
                // Already open (e.g. coming from Price): scroll now.
                if (Keyboard.isVisible()) {
                  scrollRef.current?.scrollToEnd({ animated: true });
                }
              }}
              onBlur={() => {
                descriptionFocused.current = false;
              }}
            />
          </View>

          {progress !== null && (
            <View style={styles.progress} accessibilityLiveRegion="polite">
              <View style={styles.progressRow}>
                <Text style={styles.progressLabel}>
                  {progress < 1
                    ? `Uploading ${photos.length} photo${
                        photos.length === 1 ? '' : 's'
                      }…`
                    : 'Publishing your listing…'}
                </Text>
                <Text style={styles.progressPercent}>
                  {Math.round(progress * 100)}%
                </Text>
              </View>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${Math.round(progress * 100)}%` },
                  ]}
                />
              </View>
            </View>
          )}

          <Button
            title="Post listing"
            loading={posting}
            onPress={handlePost}
            style={styles.submit}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <MapLocationPicker
        visible={locationOpen}
        initial={pickedArea ?? area}
        onSelect={picked => {
          setPickedArea(picked);
          update('location', picked.name);
        }}
        onClose={() => setLocationOpen(false)}
      />
    </TabScreen>
  );
}

const styles = StyleSheet.create({
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
  // Looks like TextField, but opens the map instead of typing.
  locationField: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  locationFieldError: {
    borderColor: colors.error,
  },
  locationText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textPrimary,
  },
  locationPlaceholder: {
    color: colors.placeholder,
  },
  pressed: {
    opacity: 0.7,
  },
  titleField: {
    marginBottom: 24,
  },
  fields: {
    marginTop: 24,
    gap: 20,
  },
  error: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.error,
  },
  submit: {
    marginTop: 32,
  },
  progress: {
    marginTop: 28,
    gap: 8,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontFamily: fonts.label,
    fontSize: 13,
    color: colors.textPrimary,
  },
  progressPercent: {
    fontFamily: fonts.label,
    fontSize: 13,
    color: colors.accent,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    backgroundColor: colors.accentSoft,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
});

export default SellScreen;
