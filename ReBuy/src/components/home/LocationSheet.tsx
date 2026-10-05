import { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { showAlert } from '../ui/AlertProvider';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Area, AREAS } from '../../data/areas';
import { getCurrentArea, LocationError } from '../../utils/currentLocation';
import { colors, fonts } from '../../theme';
import Icon from '../ui/Icon';

type Props = {
  visible: boolean;
  selected: Area;
  onSelect: (area: Area) => void;
  onClose: () => void;
};

const sameSpot = (a: Area, b: Area) => a.lat === b.lat && a.lng === b.lng;

// Bottom sheet for picking the area used for Nearby listings: the user's
// GPS position, or one of AREAS.
function LocationSheet({ visible, selected, onSelect, onClose }: Props) {
  const [locating, setLocating] = useState(false);
  const usingGps = !AREAS.some(area => sameSpot(area, selected));

  const handleCurrentLocation = async () => {
    setLocating(true);
    try {
      onSelect(await getCurrentArea());
      onClose();
    } catch (error) {
      showAlert(
        'Location unavailable',
        error instanceof LocationError
          ? error.message
          : 'Something went wrong. Please try again.',
      );
    } finally {
      setLocating(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable
        accessibilityLabel="Close location options"
        style={styles.backdrop}
        onPress={onClose}
      />
      <SafeAreaView style={styles.sheet} edges={['bottom']}>
        <Text style={styles.title}>Your location</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Use my current location"
          accessibilityState={{ busy: locating, selected: usingGps }}
          disabled={locating}
          onPress={handleCurrentLocation}
          style={({ pressed }) => [styles.option, pressed && styles.pressed]}
        >
          <Icon name="locate" size={18} color={colors.accent} />
          <View style={styles.currentText}>
            <Text style={[styles.optionText, styles.optionTextSelected]}>
              Use my current location
            </Text>
            {usingGps && (
              <Text style={styles.currentDetail} numberOfLines={1}>
                Now: {selected.name}
              </Text>
            )}
          </View>
          {locating && <ActivityIndicator color={colors.accent} />}
        </Pressable>
        <ScrollView showsVerticalScrollIndicator={false}>
          {AREAS.map(area => {
            const isSelected = sameSpot(area, selected);
            return (
              <Pressable
                key={area.name}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
                onPress={() => {
                  onSelect(area);
                  onClose();
                }}
                style={({ pressed }) => [
                  styles.option,
                  pressed && styles.pressed,
                ]}
              >
                <Icon
                  name="mapPin"
                  size={18}
                  color={isSelected ? colors.accent : colors.placeholder}
                />
                <Text
                  style={[
                    styles.optionText,
                    isSelected && styles.optionTextSelected,
                  ]}
                >
                  {area.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.shadow,
  },
  sheet: {
    maxHeight: '70%',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: colors.background,
  },
  title: {
    marginBottom: 8,
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.textPrimary,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pressed: {
    opacity: 0.6,
  },
  optionText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textPrimary,
  },
  optionTextSelected: {
    fontFamily: fonts.label,
  },
  currentText: {
    flex: 1,
  },
  currentDetail: {
    marginTop: 2,
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textSecondary,
  },
});

export default LocationSheet;
