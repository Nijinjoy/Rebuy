// Font files live in assets/fonts and are linked via react-native.config.js.
// Names are the fonts' PostScript names, which work on both iOS and Android.
// Don't combine these with `fontWeight`: each family is already one weight.
export const fonts = {
  display: 'Montserrat-ExtraBold',
  label: 'Montserrat-SemiBold',
  body: 'Montserrat-Regular',
  bodyMedium: 'Montserrat-Medium',
} as const;
