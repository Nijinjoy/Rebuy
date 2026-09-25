import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Sort, SORTS } from '../../utils/listingSearch';
import { colors, fonts } from '../../theme';

type Props = {
  visible: boolean;
  selected: Sort;
  onSelect: (sort: Sort) => void;
  onClose: () => void;
};

function SortSheet({ visible, selected, onSelect, onClose }: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable
        accessibilityLabel="Close sort options"
        style={styles.backdrop}
        onPress={onClose}
      />
      <SafeAreaView style={styles.sheet} edges={['bottom']}>
        <Text style={styles.title} accessibilityRole="header">
          Sort by
        </Text>
        {(Object.keys(SORTS) as Sort[]).map(key => {
          const isSelected = key === selected;
          return (
            <Pressable
              key={key}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              onPress={() => {
                onSelect(key);
                onClose();
              }}
              style={({ pressed }) => [
                styles.option,
                pressed && styles.pressed,
              ]}
            >
              <Text
                style={[
                  styles.optionText,
                  isSelected && styles.optionTextSelected,
                ]}
              >
                {SORTS[key]}
              </Text>
              {isSelected && <View style={styles.dot} />}
            </Pressable>
          );
        })}
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
    paddingHorizontal: 24,
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
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  optionText: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textPrimary,
  },
  optionTextSelected: {
    fontFamily: fonts.label,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.accent,
  },
  pressed: {
    opacity: 0.7,
  },
});

export default SortSheet;
