import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../../theme';
import type { Product } from '../../types/listing';
import Chip from './Chip';

// Candidate search terms. Only the ones that match a listing are shown.
const POPULAR_TERMS = [
  'iPhone',
  'MacBook',
  'iPad',
  'AirPods',
  'Sofa',
  'Chair',
  'Handbag',
  'Nike',
  'Leather',
  'Blender',
];

type Props = {
  listings: Product[];
  // Side padding of the screen, so the row scrolls edge to edge.
  inset: number;
  onSearch: (term: string) => void;
};

// One scrolling row of search suggestions, shown under Explore's search
// field. Hidden when none of the terms match a listing.
function PopularSearches({ listings, inset, onSearch }: Props) {
  const terms = useMemo(
    () =>
      POPULAR_TERMS.filter(term =>
        listings.some(p => p.title.toLowerCase().includes(term.toLowerCase())),
      ),
    [listings],
  );

  if (terms.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { paddingHorizontal: inset }]}>
        Popular searches
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.chips, { paddingHorizontal: inset }]}
      >
        {terms.map(term => (
          <Chip
            key={term}
            label={term}
            selected={false}
            onPress={() => onSearch(term)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // Space below the chips, so the list scrolling underneath doesn't touch
  // them.
  container: {
    paddingTop: 14,
    paddingBottom: 14,
    gap: 8,
  },
  label: {
    fontFamily: fonts.label,
    fontSize: 12,
    color: colors.textSecondary,
  },
  chips: {
    gap: 8,
  },
});

export default PopularSearches;
