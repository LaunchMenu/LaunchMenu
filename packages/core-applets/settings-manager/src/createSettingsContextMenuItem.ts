import {createFolderMenuItem, ISettingsFolderMenuItem} from "@launchmenu/core";
/**
 * Creates a menu item containing the given settings
 * @param settings The base settings for the context menu
 * @param appletSettings The settings for the currently opened applet
 * @returns The menu item folder containing the given settings
 */
export function createSettingsContextMenuItem<
    S extends ISettingsFolderMenuItem,
    AS extends ISettingsFolderMenuItem
>({settings, appletSettings}: {settings: S[]; appletSettings?: AS}) {
    if (appletSettings)
        return createFolderMenuItem({
            name: "Settings",
            children: {
                all: createFolderMenuItem({
                    name: "All settings",
                    children: settings,
                }),
                appletSettings,
            },
        });
    else
        return createFolderMenuItem({
            name: "Settings",
            children: settings,
        });
}
