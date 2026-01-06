const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Mock expo-notifications in development/Expo Go to prevent native module errors
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  'expo-notifications': require.resolve('./src/mocks/expo-notifications-mock.js'),
};

module.exports = config;
