const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.startsWith("@/")) {
    const resolvedPath = path.resolve(__dirname, moduleName.replace("@/", ""));
    return context.resolveRequest(context, resolvedPath, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
