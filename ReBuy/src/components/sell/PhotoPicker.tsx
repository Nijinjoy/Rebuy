import { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  ImageLibraryOptions,
  ImagePickerResponse,
  launchCamera,
  launchImageLibrary,
} from 'react-native-image-picker';
import type { ListingPhoto } from '../../services/api/listings/listingService';
import { colors, fonts, withAlpha } from '../../theme';
import { showAlert } from '../ui/AlertProvider';
import Icon, { IconName } from '../ui/Icon';

type Props = {
  photos: ListingPhoto[];
  onChange: (photos: ListingPhoto[]) => void;
  max: number;
  // Locks editing, e.g. while the listing is uploading.
  disabled?: boolean;
  error?: string;
};

const pickerOptions: ImageLibraryOptions = {
  mediaType: 'photo',
  quality: 0.8,
  maxWidth: 1600,
  maxHeight: 1600,
};

const THUMB_SIZE = 68;

function SourceButton({
  icon,
  label,
  onPress,
  disabled,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
  disabled: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.sourceButton, pressed && styles.pressed]}
    >
      <Icon name={icon} color={colors.textPrimary} size={18} />
      <Text style={styles.sourceText}>{label}</Text>
    </Pressable>
  );
}

// Photo section of the Sell form: pick from the camera or gallery, preview
// the cover, reorder by making any photo the cover, and remove photos.
function PhotoPicker({
  photos,
  onChange,
  max,
  disabled = false,
  error,
}: Props) {
  const remaining = max - photos.length;
  const cover = photos[0];
  // Measured so the cover gets exact 4:3 pixel sizes. With aspectRatio and
  // overflow: 'hidden', Android drew the box but hid everything inside it.
  const [width, setWidth] = useState(0);
  const coverSize = { width, height: Math.round((width * 3) / 4) };

  const handlePicked = (response: ImagePickerResponse) => {
    if (response.didCancel) {
      return;
    }
    if (response.errorCode) {
      showAlert(
        "Couldn't add photos",
        response.errorCode === 'camera_unavailable'
          ? 'No camera is available on this device.'
          : response.errorCode === 'permission'
          ? 'Allow ReBuy to access your camera and photos in Settings.'
          : 'Please try again.',
      );
      return;
    }
    const picked = (response.assets ?? []).flatMap(asset =>
      asset.uri
        ? [{ uri: asset.uri, type: asset.type, fileName: asset.fileName }]
        : [],
    );
    const next = [...photos, ...picked];
    if (next.length > max) {
      showAlert(
        `Only ${max} photos allowed`,
        `We kept the first ${max}. Remove one to add another.`,
      );
    }
    onChange(next.slice(0, max));
  };

  // Rejects when the native picker is missing from the app build.
  const pick = (launch: () => Promise<ImagePickerResponse>) => {
    launch()
      .then(handlePicked)
      .catch(() =>
        showAlert(
          "Couldn't open photos",
          'The photo picker is not available in this build of the app.',
        ),
      );
  };

  const openCamera = () =>
    pick(() => launchCamera({ ...pickerOptions, saveToPhotos: false }));
  const openGallery = () =>
    pick(() =>
      launchImageLibrary({ ...pickerOptions, selectionLimit: remaining }),
    );

  const chooseSource = () => {
    showAlert(
      'Add photos',
      `You can add ${remaining} more.`,
      [
        { text: 'Take photo', onPress: openCamera },
        { text: 'Choose from gallery', onPress: openGallery },
        { text: 'Cancel', style: 'cancel' },
      ],
      { icon: 'camera' },
    );
  };

  const remove = (index: number) => {
    onChange(photos.filter((_, i) => i !== index));
  };

  const makeCover = (index: number) => {
    if (index === 0) {
      return;
    }
    const next = [...photos];
    const [photo] = next.splice(index, 1);
    onChange([photo, ...next]);
  };

  if (!cover) {
    return (
      <View>
        <View style={[styles.emptyCard, !!error && styles.emptyCardError]}>
          <View style={styles.emptyIcon}>
            <Icon name="camera" color={colors.accent} size={28} />
          </View>
          <Text style={styles.emptyTitle}>Add photos of your item</Text>
          <Text style={styles.emptyText}>
            Clear, bright photos sell faster. Add up to {max}.
          </Text>
          <View style={styles.sources}>
            <SourceButton
              icon="camera"
              label="Camera"
              onPress={openCamera}
              disabled={disabled}
            />
            <SourceButton
              icon="image"
              label="Gallery"
              onPress={openGallery}
              disabled={disabled}
            />
          </View>
        </View>
        {!!error && <Text style={styles.error}>{error}</Text>}
      </View>
    );
  }

  return (
    <View
      style={[styles.container, disabled && styles.disabled]}
      onLayout={event => setWidth(event.nativeEvent.layout.width)}
    >
      <View style={[styles.cover, coverSize]}>
        <Image
          source={{ uri: cover.uri }}
          style={[styles.coverImage, coverSize]}
          resizeMode="cover"
        />
        <View style={styles.coverBadge}>
          <Text style={styles.coverBadgeText}>Cover photo</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Remove cover photo"
          hitSlop={8}
          disabled={disabled}
          onPress={() => remove(0)}
          style={({ pressed }) => [
            styles.removeLarge,
            pressed && styles.pressed,
          ]}
        >
          <Icon name="trash" color={colors.onPrimary} size={16} />
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.thumbs}
      >
        {photos.map((photo, index) => (
          <Pressable
            key={`${photo.uri}-${index}`}
            accessibilityRole="button"
            accessibilityLabel={
              index === 0 ? 'Photo 1, cover' : `Photo ${index + 1}. Make cover`
            }
            disabled={disabled}
            onPress={() => makeCover(index)}
            style={({ pressed }) => [
              styles.thumb,
              index === 0 && styles.thumbCover,
              pressed && styles.pressed,
            ]}
          >
            <Image source={{ uri: photo.uri }} style={styles.thumbImage} />
            <View style={styles.thumbNumber}>
              <Text style={styles.thumbNumberText}>{index + 1}</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Remove photo ${index + 1}`}
              hitSlop={8}
              disabled={disabled}
              onPress={() => remove(index)}
              style={({ pressed }) => [
                styles.removeSmall,
                pressed && styles.pressed,
              ]}
            >
              <Icon name="close" color={colors.onPrimary} size={10} />
            </Pressable>
          </Pressable>
        ))}

        {remaining > 0 && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Add photos, ${photos.length} of ${max} added`}
            disabled={disabled}
            onPress={chooseSource}
            style={({ pressed }) => [
              styles.thumb,
              styles.addThumb,
              pressed && styles.pressed,
            ]}
          >
            <Icon name="plus" color={colors.accent} size={20} />
            <Text style={styles.addThumbText}>
              {photos.length}/{max}
            </Text>
          </Pressable>
        )}
      </ScrollView>

      <Text style={styles.hint}>
        {photos.length > 1
          ? 'Tap a photo to make it the cover.'
          : 'Add more angles and any flaws so buyers know what to expect.'}
      </Text>
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  disabled: {
    opacity: 0.6,
  },
  pressed: {
    opacity: 0.7,
  },
  emptyCard: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderRadius: 18,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.accent,
    backgroundColor: colors.accentTint,
  },
  emptyCardError: {
    borderColor: colors.error,
  },
  emptyIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    backgroundColor: colors.accentSoft,
  },
  emptyTitle: {
    fontFamily: fonts.display,
    fontSize: 16,
    color: colors.textPrimary,
  },
  emptyText: {
    marginTop: 4,
    textAlign: 'center',
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  sources: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  sourceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  sourceText: {
    fontFamily: fonts.label,
    fontSize: 13,
    color: colors.textPrimary,
  },
  // No overflow: 'hidden' here; the image rounds its own corners, like
  // the thumbnails do.
  cover: {
    borderRadius: 18,
    // Shows only while the photo loads.
    backgroundColor: colors.backgroundAlt,
  },
  coverImage: {
    borderRadius: 18,
  },
  coverBadge: {
    position: 'absolute',
    left: 12,
    bottom: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: colors.primary,
  },
  coverBadgeText: {
    fontFamily: fonts.label,
    fontSize: 11,
    color: colors.onPrimary,
  },
  removeLarge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withAlpha(colors.primary, 0.7),
  },
  // Room for the remove buttons that overhang each thumbnail's corner.
  thumbs: {
    gap: 12,
    paddingTop: 8,
    paddingRight: 8,
  },
  // White card around each photo, like the form's inputs and chips.
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    padding: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  thumbCover: {
    borderWidth: 2,
    borderColor: colors.accent,
  },
  thumbImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  thumbNumber: {
    position: 'absolute',
    left: 4,
    bottom: 4,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withAlpha(colors.primary, 0.75),
  },
  thumbNumberText: {
    fontFamily: fonts.label,
    fontSize: 10,
    color: colors.onPrimary,
  },
  removeSmall: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.background,
    backgroundColor: colors.primary,
  },
  addThumb: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.accent,
    backgroundColor: colors.surface,
  },
  addThumbText: {
    fontFamily: fonts.label,
    fontSize: 11,
    color: colors.accent,
  },
  hint: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textSecondary,
  },
  error: {
    marginTop: 8,
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.error,
  },
});

export default PhotoPicker;
