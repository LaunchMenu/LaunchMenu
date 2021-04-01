import {DataCacher, Field, IDataHook, IDataRetriever} from "model-react";
import {SettingsContext} from "../../settings/SettingsContext";
import {SettingsFile} from "../../settings/storage/fileTypes/SettingsFile";
import {ISettingsFolderMenuItem} from "../../settings/_types/ISettingsFolderMenuItem";
import {IUUID} from "../../_types/IUUID";
import {IApplet} from "../applets/_types/IApplet";
import {ISettingsData} from "./_types/ISettingsData";
import Path from "path";
import {IAppletData} from "../applets/_types/IAppletData";
import {fileInputBasePathConfigurationSymbol} from "../../menus/items/inputs/types/createFileMenuItem";
import {ISettingsTree} from "../../settings/_types/ISettingsTree";

/**
 * Manages the settings within LaunchMenu
 */
export class SettingsManager {
    protected settingsDirectory: string;
    protected dataDirectory: string;

    protected extraFiles = new Field([] as ISettingsData[]);

    protected destroyed = new Field(false);
    protected appletSettings = new Field([] as ISettingsData[]);

    /**
     * Creates a new settings manager, which auto loads the settings of the passed applets
     * @param settingsDirectory The directory to load the settings for the applets from
     * @param dataDirectory The directory that LM data is stored in
     */
    public constructor(
        settingsDirectory: string,
        dataDirectory: string = Path.join(settingsDirectory, "data")
    ) {
        this.settingsDirectory = settingsDirectory;
        this.dataDirectory = dataDirectory;
    }

    /**
     * Disposes of all data
     */
    public destroy(): void {
        if (!this.destroyed.get()) {
            [...this.extraFiles.get(), ...this.appletSettings.get()].forEach(({file}) =>
                file.destroy()
            );
        }
        this.destroyed.set(true);
    }

    // Getters
    /**
     * Retrieves the settings data with a given ID
     * @param ID The ID of the data to retrieve
     * @param hook A hook to subscribe to changes
     * @returns The settings data
     */
    public getSettingsData(ID: IUUID, hook?: IDataHook): ISettingsData | null {
        return this.getAllSettingsData(hook).find(({ID: OID}) => OID == ID) ?? null;
    }

    /**
     * Retrieves the settings data in the manager
     * @param hook A hook to subscribe to changes
     * @returns The settings data
     */
    public getAllSettingsData(hook?: IDataHook): ISettingsData[] {
        return [...this.extraFiles.get(hook), ...this.appletSettings.get(hook)];
    }

    /**
     * Retrieves the settings data in the manager for all files that have unsaved changes
     * @param hook A hook to subscribe to changes
     * @returns The settings data that hasn't been saved
     */
    public getAllDirtySettingsData(hook?: IDataHook): ISettingsData[] {
        return this.dirtySettingsData.get(hook);
    }

    /**
     * Retrieves the settings files that are dirty
     */
    protected dirtySettingsData = new DataCacher(h => {
        const settingsData = this.getAllSettingsData(h);
        return settingsData.filter(({file}) => file.isDirty(h));
    });

    /**
     * Retrieves a settings context that contains all settings in this manager
     * @param hook A hook to subscribe to changes
     * @returns The context that includes all settings
     */
    public getSettingsContext(hook?: IDataHook): SettingsContext {
        const data = {} as {[id: string]: ISettingsFolderMenuItem};
        this.getAllSettingsData(hook).forEach(({ID, file}) => {
            data[ID] = file.settings;
        });
        return new SettingsContext(data);
    }

    // Settings management
    /**
     * Adds the specified settings to the manager
     * @param ID The identifier for the settings
     * @param settings The settings to be added
     * @param applet An applet that the settings are connected to
     */
    public addSettings(ID: IUUID, settings: SettingsFile<any>, applet?: IApplet): void {
        this.extraFiles.set([
            ...this.extraFiles.get(),
            {
                ID,
                file: settings,
                applet,
            },
        ]);
        settings.load(); // TODO: add check whether not already loaded
    }

    /**
     * Updates the specified settings, removing the old version
     * @param ID The identifier for the settings
     * @param settings The settings to be updated
     * @param applet An applet that the settings are connected to
     */
    public updateSettings(
        ID: IUUID,
        settings: SettingsFile<any>,
        applet?: IApplet
    ): void {
        const files = this.extraFiles.get();
        this.extraFiles.set([
            ...files.filter(({ID: OID}) => OID != ID),
            {
                ID,
                file: settings,
                applet,
            },
        ]);
        settings.load(); // TODO: add check whether not already loaded
    }

    /**
     * Removes the settings with the specified id
     * @param ID The ID of the settings to remove
     */
    public removeSettings(ID: IUUID): void {
        const files = this.extraFiles.get();
        this.extraFiles.set(files.filter(({ID: OID}) => OID != ID));
    }

    // Setting methods
    /**
     * Reloads all the settings
     */
    public async reloadAll(): Promise<void> {
        await Promise.all(this.getAllDirtySettingsData().map(({file}) => file.load()));
    }

    /**
     * Saves all settings in the session
     */
    public async saveAll(): Promise<void> {
        await Promise.all(this.getAllDirtySettingsData().map(({file}) => file.save()));
    }

    // Applet settings management
    /**
     * Updates the settings for a given applet, used by the applet manager
     * @param appletData The applet data to update
     * @param version The new version of the applet
     * @returns The tree of settings for this applet
     */
    public updateAppletSettings(applet: IApplet, version?: IUUID): ISettingsTree {
        this.destroyAppletSetting(applet.ID);

        const settings = applet.settings;
        settings.ID = applet.ID;

        // Create the settings file at the correct file path
        const settingsFile = new SettingsFile({
            ...settings,
            path: Path.join(this.settingsDirectory, "applets", applet.ID + ".json"),
        });

        // Inject the base directory for file settings to use
        settingsFile.configure({
            [fileInputBasePathConfigurationSymbol]: Path.join(
                this.dataDirectory,
                "appletData",
                `${applet.ID}`
            ),
        });

        // Load the settings from the file if present
        settingsFile.load();

        this.appletSettings.set([
            ...this.appletSettings.get(),
            {
                ID: applet.ID,
                file: settingsFile,
                appletVersion: version,
                applet,
            },
        ]);

        // Return the settings tree
        return settingsFile.fields;
    }

    /**
     * Removes the settings of an applet
     * @param appletID The ID of the applet to remove
     */
    public destroyAppletSetting(appletID: IUUID): void {
        const allSettings = this.appletSettings.get();
        const settings = allSettings.find(({ID}) => appletID == ID);
        if (settings) {
            settings.file.destroy();
            this.appletSettings.set(allSettings.filter(({ID}) => ID == appletID));
        }
    }
}
