import type { IconName } from '../components/ui/Icon';

// Icon per category slug; categories added on the server later fall back
// to a generic tag.
const CATEGORY_ICONS: Record<string, IconName> = {
  electronics: 'tv',
  furniture: 'sofa',
  'home-appliances': 'washer',
  'mobiles-tablets': 'smartphone',
  fashion: 'shirt',
  'kids-baby': 'baby',
  sports: 'dumbbell',
  other: 'grid',
};

export function categoryIcon(slug: string): IconName {
  return CATEGORY_ICONS[slug] ?? 'tag';
}
