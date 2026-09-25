module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: ['./jest.setup.js'],
  moduleNameMapper: {
    // Reanimated 4.7's native initializer calls APIs its Jest (JS) backend
    // doesn't implement; the web initializer skips them.
    '^\\./initializers(\\.js)?$': './initializers.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-navigation|react-native-(svg|gesture-handler|reanimated|worklets|screens|safe-area-context|drawer-layout))/)',
  ],
};
