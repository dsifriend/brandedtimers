const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Explicitly set project root and watch only local node_modules
config.projectRoot = __dirname;
config.watchFolders = [path.resolve(__dirname, "node_modules")];

// Force Metro to use local node_modules only
config.resolver.nodeModulesPaths = [path.resolve(__dirname, "node_modules")];

// Block global pnpm paths
config.resolver.blockList = [/\/\.pnpm\//, /\/pnpm\/global\//];

// Path alias resolution
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.startsWith("@/")) {
    const resolvedPath = path.resolve(__dirname, moduleName.replace("@/", ""));
    return context.resolveRequest(context, resolvedPath, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
