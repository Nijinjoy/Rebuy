module.exports = api => {
  const isProduction = api.env('production');

  return {
    presets: ['module:@react-native/babel-preset'],
    // Must be listed last.
    plugins: [
      '@babel/plugin-transform-export-namespace-from',
      ...(isProduction ? ['transform-remove-console'] : []),
      'react-native-worklets/plugin',
    ],
  };
};
