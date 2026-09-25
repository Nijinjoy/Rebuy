import { useState } from 'react';
import {
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors, fonts, palette, withAlpha } from '../../theme';

type Props = {
  title: string;
  images: string[];
  width: number;
  height: number;
};

// Swipeable listing photos with a page counter and dots.
function PhotoGallery({ title, images, width, height }: Props) {
  const [index, setIndex] = useState(0);
  const pages = images.map((uri, i) => ({ uri, i }));

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const page = Math.round(e.nativeEvent.contentOffset.x / width);
    if (page !== index) {
      setIndex(page);
    }
  };

  return (
    <View style={{ width, height }}>
      <FlatList
        data={pages}
        keyExtractor={page => page.uri}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        getItemLayout={(_, i) => ({
          length: width,
          offset: width * i,
          index: i,
        })}
        renderItem={({ item }) => (
          <View style={[styles.page, { width, height }]}>
            {/* The initial shows while the photo loads or if it fails. */}
            <Text style={[styles.initial, { fontSize: height * 0.3 }]}>
              {title.charAt(0).toUpperCase()}
            </Text>
            <Image
              source={{ uri: item.uri }}
              style={StyleSheet.absoluteFill}
              resizeMode="contain"
              accessibilityLabel={`${title}, photo ${item.i + 1} of ${
                pages.length
              }`}
            />
          </View>
        )}
        ListEmptyComponent={
          <View style={[styles.page, styles.empty, { width, height }]}>
            <Text style={[styles.initial, { fontSize: height * 0.3 }]}>
              {title.charAt(0).toUpperCase()}
            </Text>
          </View>
        }
      />
      {pages.length > 1 && (
        <>
          <View style={styles.counter}>
            <Text style={styles.counterText}>
              {index + 1} / {pages.length}
            </Text>
          </View>
          <View style={styles.dots} pointerEvents="none">
            {pages.map(({ uri, i }) => (
              <View
                key={uri}
                style={[styles.dot, i === index && styles.dotActive]}
              />
            ))}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  empty: {
    backgroundColor: colors.accentSoft,
  },
  initial: {
    fontFamily: fonts.display,
    color: colors.border,
  },
  counter: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: withAlpha(palette.ink, 0.7),
  },
  counterText: {
    fontFamily: fonts.label,
    fontSize: 12,
    color: colors.onPrimary,
  },
  dots: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 22,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: withAlpha(palette.ink, 0.25),
  },
  dotActive: {
    width: 18,
    backgroundColor: colors.primary,
  },
});

export default PhotoGallery;
