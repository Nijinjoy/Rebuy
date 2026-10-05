import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import MapView, { Region } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Area } from '../../data/areas';
import { colors, fonts } from '../../theme';
import {
  getPosition,
  LocationError,
  placeAddress,
} from '../../utils/currentLocation';
import {
  getPlaceLocation,
  PlaceSuggestion,
  searchPlaces,
} from '../../utils/places';
import Button from '../ui/Button';
import Icon from '../ui/Icon';

type Props = {
  visible: boolean;
  // Where the map opens: the location already chosen, or the user's area.
  initial: Area;
  onSelect: (area: Area) => void;
  onClose: () => void;
};

// A few streets on screen: close enough for buildings to be drawn.
const ZOOM = { latitudeDelta: 0.004, longitudeDelta: 0.004 };
const SEARCH_DELAY_MS = 300;
const MIN_QUERY_LENGTH = 2;
// About 50 m: the map settles slightly off the point it was sent to.
const SAME_SPOT_DEGREES = 0.0005;

type Spot = { lat: number; lng: number };

const near = (a: Spot, b: Spot) =>
  Math.abs(a.lat - b.lat) < SAME_SPOT_DEGREES &&
  Math.abs(a.lng - b.lng) < SAME_SPOT_DEGREES;

// Mounted each time the picker opens, so it always starts from `initial`.
function PickerBody({ initial, onSelect, onClose }: Omit<Props, 'visible'>) {
  const mapRef = useRef<MapView>(null);
  // The place under the pin, named down to the street.
  const [place, setPlace] = useState<Area>(initial);
  const placeRef = useRef(place);
  const [naming, setNaming] = useState(false);
  const namingRequest = useRef(0);

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Looks up the address of a point and shows it as the chosen place.
  // `label` is the name of a searched place, used instead of the street.
  const nameSpot = (spot: Spot, label?: string) => {
    const request = ++namingRequest.current;
    placeRef.current = { name: '', ...spot };
    setNaming(true);
    placeAddress(spot.lat, spot.lng, label)
      .catch(() => label ?? null)
      .then(name => {
        if (request === namingRequest.current) {
          setPlace({ name: name ?? 'Pinned location', ...spot });
          setNaming(false);
        }
      });
  };

  const goTo = (spot: Spot, label?: string) => {
    nameSpot(spot, label);
    mapRef.current?.animateToRegion(
      { latitude: spot.lat, longitude: spot.lng, ...ZOOM },
      400,
    );
  };

  // Look up suggestions shortly after the user stops typing.
  useEffect(() => {
    const text = query.trim();
    if (text.length < MIN_QUERY_LENGTH) {
      setSuggestions([]);
      setSearching(false);
      return;
    }
    let active = true;
    setSearching(true);
    const timer = setTimeout(() => {
      searchPlaces(text)
        .then(found => {
          if (active) {
            setSuggestions(found);
            setError(null);
          }
        })
        .catch(() => {
          if (active) {
            setSuggestions([]);
            setError('Search is unavailable. Move the map instead.');
          }
        })
        .finally(() => {
          if (active) {
            setSearching(false);
          }
        });
    }, SEARCH_DELAY_MS);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query]);

  const handleSuggestion = async (suggestion: PlaceSuggestion) => {
    Keyboard.dismiss();
    setQuery('');
    setError(null);
    try {
      const location = await getPlaceLocation(suggestion.placeId);
      goTo(location, suggestion.title);
    } catch {
      setError("We couldn't open that place. Try another one.");
    }
  };

  const handleCurrentLocation = async () => {
    Keyboard.dismiss();
    setLocating(true);
    setError(null);
    try {
      goTo(await getPosition());
    } catch (e) {
      setError(
        e instanceof LocationError
          ? e.message
          : 'Something went wrong. Please try again.',
      );
    } finally {
      setLocating(false);
    }
  };

  // The user dragged the map: name whatever is under the pin now.
  const handleRegionChange = (region: Region) => {
    const centre = { lat: region.latitude, lng: region.longitude };
    if (!near(centre, placeRef.current)) {
      nameSpot(centre);
    }
  };

  const showSuggestions = query.trim().length >= MIN_QUERY_LENGTH;

  return (
    <View style={styles.flex}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={{
          latitude: initial.lat,
          longitude: initial.lng,
          ...ZOOM,
        }}
        onRegionChangeComplete={handleRegionChange}
        onPanDrag={() => Keyboard.dismiss()}
        showsUserLocation
        showsMyLocationButton={false}
        toolbarEnabled={false}
        showsBuildings
        showsPointsOfInterests
        rotateEnabled={false}
      />

      {/* Fixed pin: the map moves underneath it. */}
      <View style={styles.pin} pointerEvents="none">
        <Icon
          name="mapPin"
          color={colors.primary}
          fill={colors.accent}
          size={40}
        />
      </View>

      <SafeAreaView style={styles.top} edges={['top']} pointerEvents="box-none">
        <View style={styles.searchRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close map"
            hitSlop={8}
            onPress={onClose}
            style={({ pressed }) => [styles.round, pressed && styles.pressed]}
          >
            <Icon name="close" color={colors.textPrimary} size={20} />
          </Pressable>
          <View style={styles.search}>
            <Icon name="search" color={colors.textSecondary} size={18} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for an area or place"
              placeholderTextColor={colors.placeholder}
              value={query}
              onChangeText={setQuery}
              accessibilityLabel="Search for a location"
              returnKeyType="search"
              autoCorrect={false}
            />
            {searching && <ActivityIndicator color={colors.accent} />}
            {!searching && query.length > 0 && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Clear search"
                hitSlop={8}
                onPress={() => setQuery('')}
              >
                <Icon name="close" color={colors.textSecondary} size={18} />
              </Pressable>
            )}
          </View>
        </View>

        {showSuggestions && !searching && (
          <ScrollView
            style={styles.suggestions}
            keyboardShouldPersistTaps="handled"
          >
            {suggestions.length === 0 && (
              <Text style={styles.empty}>No places found.</Text>
            )}
            {suggestions.map((suggestion, index) => (
              <Pressable
                key={suggestion.placeId}
                accessibilityRole="button"
                onPress={() => handleSuggestion(suggestion)}
                style={({ pressed }) => [
                  styles.suggestion,
                  index > 0 && styles.suggestionDivider,
                  pressed && styles.pressed,
                ]}
              >
                <Icon name="mapPin" color={colors.accent} size={18} />
                <View style={styles.flex}>
                  <Text style={styles.suggestionTitle} numberOfLines={1}>
                    {suggestion.title}
                  </Text>
                  {!!suggestion.subtitle && (
                    <Text style={styles.suggestionSubtitle} numberOfLines={1}>
                      {suggestion.subtitle}
                    </Text>
                  )}
                </View>
              </Pressable>
            ))}
          </ScrollView>
        )}
      </SafeAreaView>

      <SafeAreaView
        style={styles.bottom}
        edges={['bottom']}
        pointerEvents="box-none"
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Use my current location"
          accessibilityState={{ busy: locating }}
          disabled={locating}
          onPress={handleCurrentLocation}
          style={({ pressed }) => [
            styles.round,
            styles.locate,
            pressed && styles.pressed,
          ]}
        >
          {locating ? (
            <ActivityIndicator color={colors.accent} />
          ) : (
            <Icon name="locate" color={colors.textPrimary} size={20} />
          )}
        </Pressable>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Item location</Text>
          <Text style={styles.cardName} numberOfLines={2}>
            {naming ? 'Finding place…' : place.name}
          </Text>
          {!!error && (
            <Text style={styles.error} accessibilityRole="alert">
              {error}
            </Text>
          )}
          <Button
            title="Confirm location"
            disabled={naming}
            onPress={() => {
              onSelect(place);
              onClose();
            }}
            style={styles.confirm}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

// Full-screen map for choosing where an item is: search for a place, use
// the current position, or drag the map under the pin.
function MapLocationPicker({ visible, onClose, ...props }: Props) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <PickerBody onClose={onClose} {...props} />
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  // Lifted by half its height so the pin's tip marks the map centre.
  pin: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
  },
  top: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
  },
  round: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  pressed: {
    opacity: 0.7,
  },
  search: {
    flex: 1,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    backgroundColor: colors.surface,
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    padding: 0,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textPrimary,
  },
  suggestions: {
    maxHeight: 300,
    marginTop: 8,
    borderRadius: 16,
    backgroundColor: colors.surface,
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  suggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  suggestionDivider: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  suggestionTitle: {
    fontFamily: fonts.label,
    fontSize: 14,
    color: colors.textPrimary,
  },
  suggestionSubtitle: {
    marginTop: 2,
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textSecondary,
  },
  empty: {
    padding: 16,
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textSecondary,
  },
  bottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
  },
  locate: {
    alignSelf: 'flex-end',
    marginBottom: 12,
  },
  card: {
    marginBottom: 12,
    padding: 18,
    borderRadius: 22,
    backgroundColor: colors.surface,
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  cardLabel: {
    fontFamily: fonts.label,
    fontSize: 12,
    color: colors.textSecondary,
  },
  cardName: {
    marginTop: 4,
    fontFamily: fonts.display,
    fontSize: 16,
    lineHeight: 22,
    color: colors.textPrimary,
  },
  error: {
    marginTop: 8,
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.error,
  },
  confirm: {
    marginTop: 14,
  },
});

export default MapLocationPicker;
