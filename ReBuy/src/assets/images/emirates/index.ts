import type { ImageSourcePropType } from 'react-native';

// Photos for Explore's "Browse by emirate" cards, keyed by emirate name
// (as in EMIRATES in src/data/areas.ts).
// Photos are 300×300 crops from Wikimedia Commons; see CREDITS.md for
// authors and licenses.
// To change one, replace the file here. Metro fails to build if a required
// file is missing. Emirates without an entry show their initial instead.
export const EMIRATE_IMAGES: Partial<Record<string, ImageSourcePropType>> = {
  Dubai: require('./dubai.jpg'),
  'Abu Dhabi': require('./abu-dhabi.jpg'),
  Sharjah: require('./sharjah.jpg'),
  Ajman: require('./ajman.jpg'),
  'Ras Al Khaimah': require('./ras-al-khaimah.jpg'),
  Fujairah: require('./fujairah.jpg'),
  'Umm Al Quwain': require('./umm-al-quwain.jpg'),
};
