import { IPlatform } from "./_types/IPlatform";

/**
 * Checks whether we are currently running on one of the specified platforms
 * @param platforms The platforms to check for
 * @returns true if platform is included in platforms, false otherwise
 */
export function isPlatform(...platforms: IPlatform[]): boolean {
  return platforms.map<string>(p=>nodePlatformMap[p]).includes(process.platform);
}

/**
 * A mapping from LM platform names to node platform names
 */
export const nodePlatformMap = {
    mac: "darwin",
    windows: "win32",
    linux: "linux"
} as const;