import type { ImageSourcePropType } from 'react-native';

export const EMIRATE_IMAGES: Partial<Record<string, ImageSourcePropType>> = {
  Dubai: require('./dubai/dubai.jpg'),
  'Abu Dhabi': require('./abu-dhabi/abu-dhabi.jpg'),
  Sharjah: require('./sharjah/sharjah.jpg'),
  Ajman: require('./ajman/ajman.jpg'),
  'Ras Al Khaimah': require('./ras-al-khaimah/ras-al-khaimah.jpg'),
  Fujairah: require('./fujairah/fujairah.jpg'),
  'Umm Al Quwain': require('./umm-al-quwain/umm-al-quwain.jpg'),
};
