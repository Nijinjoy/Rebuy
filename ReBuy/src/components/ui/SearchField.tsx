import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { colors, fonts } from '../../theme';
import Icon from './Icon';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
};

// Rounded search box with a clear button once there's text.
function SearchField({ value, onChangeText, placeholder }: Props) {
  return (
    <View style={styles.search}>
      <Icon name="search" color={colors.textSecondary} size={20} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        value={value}
        onChangeText={onChangeText}
        accessibilityLabel="Search items"
        returnKeyType="search"
        autoCorrect={false}
      />
      {value.length > 0 && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          hitSlop={8}
          onPress={() => onChangeText('')}
        >
          <Icon name="close" color={colors.textSecondary} size={18} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  search: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 18,
    borderRadius: 27,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: {
    flex: 1,
    height: '100%',
    padding: 0,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textPrimary,
  },
});

export default SearchField;
