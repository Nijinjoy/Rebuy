import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../../theme';
import type { Category, CategoryInfo } from '../../types/listing';
import { categoryIcon } from '../../utils/categoryIcons';
import Icon from '../ui/Icon';

type Props = {
  categories: CategoryInfo[];
  selected: Category | null;
  onSelect: (category: Category) => void;
  disabled?: boolean;
};

// Grid of icon tiles for choosing a listing's category.
function CategoryPicker({ categories, selected, onSelect, disabled }: Props) {
  return (
    <View style={styles.grid} accessibilityRole="radiogroup">
      {categories.map(({ name, slug }) => {
        const isSelected = selected === name;
        return (
          <Pressable
            key={name}
            accessibilityRole="radio"
            accessibilityState={{ selected: isSelected, disabled }}
            accessibilityLabel={name}
            disabled={disabled}
            onPress={() => onSelect(name)}
            style={({ pressed }) => [
              styles.tile,
              isSelected && styles.tileSelected,
              pressed && styles.pressed,
            ]}
          >
            <View style={[styles.icon, isSelected && styles.iconSelected]}>
              <Icon
                name={categoryIcon(slug)}
                color={isSelected ? colors.onPrimary : colors.textPrimary}
                size={22}
              />
            </View>
            <Text
              style={[styles.label, isSelected && styles.labelSelected]}
              numberOfLines={2}
            >
              {name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  // Four tiles per row, leaving room for the gaps on narrow phones.
  tile: {
    width: '22%',
    flexGrow: 1,
    maxWidth: '25%',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 4,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  tileSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.accentTint,
  },
  pressed: {
    opacity: 0.7,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentSoft,
  },
  iconSelected: {
    backgroundColor: colors.primary,
  },
  label: {
    minHeight: 30,
    textAlign: 'center',
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    lineHeight: 15,
    color: colors.textSecondary,
  },
  labelSelected: {
    fontFamily: fonts.label,
    color: colors.textPrimary,
  },
});

export default CategoryPicker;
