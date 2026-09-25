/* eslint-env jest */
require('react-native-gesture-handler/jestSetup');

jest.mock('react-native-worklets', () =>
  require('react-native-worklets/lib/module/mock'),
);
require('react-native-reanimated').setUpTests();

// Native picker isn't available under Jest; tests never open it.
jest.mock('react-native-image-picker', () => ({
  launchCamera: jest.fn(() => Promise.resolve({ didCancel: true })),
  launchImageLibrary: jest.fn(() => Promise.resolve({ didCancel: true })),
}));

// No GPS under Jest; tests never ask for the current location.
jest.mock('@react-native-community/geolocation', () => ({
  getCurrentPosition: jest.fn(),
  setRNConfiguration: jest.fn(),
}));
