module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      // react-native-worklets is installed (required peer dep of reanimated v4).
      // babel-preset-expo auto-detects it and injects react-native-worklets/plugin — this is correct.
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
  };
};
