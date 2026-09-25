import { DefaultTheme, Theme } from '@react-navigation/native';
import { colors } from '../theme';

// Brand colours for React Navigation's built-in UI (headers, cards, etc.).
export const navigationTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.textPrimary,
    border: colors.border,
  },
};
