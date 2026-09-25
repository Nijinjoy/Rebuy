import { Ref, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputInstance,
  TextInputProps,
  View,
} from 'react-native';
import { colors, fonts } from '../../theme';

type Props = Omit<TextInputProps, 'ref'> & {
  ref?: Ref<TextInputInstance>;
  label: string;
  error?: string;
  // Adds a Show/Hide toggle and masks the input.
  password?: boolean;
};

function TextField({
  ref,
  label,
  error,
  password = false,
  onFocus,
  onBlur,
  style,
  ...inputProps
}: Props) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(password);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.field,
          inputProps.multiline && styles.fieldMultiline,
          focused && styles.fieldFocused,
          !!error && styles.fieldError,
        ]}
      >
        <TextInput
          ref={ref}
          style={[
            styles.input,
            inputProps.multiline && styles.inputMultiline,
            style,
          ]}
          placeholderTextColor={colors.placeholder}
          secureTextEntry={hidden}
          accessibilityLabel={label}
          onFocus={e => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={e => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...inputProps}
        />
        {password && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Show password' : 'Hide password'}
            hitSlop={8}
            onPress={() => setHidden(h => !h)}
          >
            <Text style={styles.toggle}>{hidden ? 'Show' : 'Hide'}</Text>
          </Pressable>
        )}
      </View>
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  label: {
    fontFamily: fonts.label,
    fontSize: 13,
    color: colors.textPrimary,
  },
  field: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  fieldMultiline: {
    height: 'auto',
    minHeight: 120,
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  fieldFocused: {
    borderColor: colors.accent,
  },
  fieldError: {
    borderColor: colors.error,
  },
  input: {
    flex: 1,
    height: '100%',
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textPrimary,
  },
  inputMultiline: {
    height: 'auto',
    minHeight: 96,
    textAlignVertical: 'top',
  },
  toggle: {
    fontFamily: fonts.label,
    fontSize: 13,
    color: colors.accent,
  },
  error: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.error,
  },
});

export default TextField;
