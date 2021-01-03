import {createSettings} from "../../../settings/createSettings";

/**
 * The base settings for the application
 */
export const baseSettings = createSettings({
    version: "0.0.0",
    settings: (): ReturnType<
        typeof import("./createBaseSettingsFolder").createBaseSettingsFolder
    > => {
        // Dynamic import to prevent dependency cycles, since the base settings are used throughout the whole application
        return require("./createBaseSettingsFolder").createBaseSettingsFolder();
    },
});
