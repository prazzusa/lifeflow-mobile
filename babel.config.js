module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      // reanimated: false — disables auto-injection of react-native-reanimated/plugin.
      // Reanimated v4 + New Architecture (RN 0.81) handles transforms at runtime, no Babel plugin needed.
      ["babel-preset-expo", { jsxImportSource: "nativewind", reanimated: false }],
      "nativewind/babel",
    ],
  };
};
