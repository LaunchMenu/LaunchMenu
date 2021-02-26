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

/**
 * Manages the settings within LaunchMenu
 */
export class SettingsManager {
    protected appletsSource: IDataRetriever<IAppletData[]>;
    protected settingsDirectory: string;
    protected dataDirectory: string;

    protected extraFiles = new Field([] as ISettingsData[]);

    protected destroyed = new Field(false);

    /**
     * Creates a new settings manager, which auto loads the settings of the passed applets
     * @param appletsSource The retriever for the applets
     * @param settingsDirectory The directory to load the settings for the applets from
     * @param dataDirectory The directory that LM data is stored in
     */
    public constructor(
        appletsSource: IDataRetriever<IAppletData[]>,
        settingsDirectory: string,
        dataDirectory: string = Path.join(settingsDirectory, "data")
    ) {
        this.appletsSource = appletsSource;
        this.settingsDirectory = settingsDirectory;
        this.dataDirectory = dataDirectory;
    }

    /**
     * Disposes of all data
     */
    public destroy(): void {
        this.destroyed.set(true);
        // Force retrieve the applets to uninitialize old settings
        this.appletSettings.get();
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
     * Retrieves the applet settings given the applets source
     */
    protected appletSettings = new DataCacher<ISettingsData[]>(
        (h, prevAppletSettings = []) => {
            const destroyed = this.destroyed.get(h);
            const applets = destroyed ? [] : this.appletsSource(h);

            // Remove any old applets settings
            prevAppletSettings.forEach(({ID, file, appletVersion}) => {
                const used = applets.find(
                    ({applet, version}) => applet.ID == ID && version == appletVersion
                );
                if (!used) file.destroy();
            });

            // Obtain the new applet settings
            const appletSettings = applets.flatMap(({applet, version}) => {
                const current = prevAppletSettings.find(
                    p => p.appletVersion == version && p.ID == applet.ID
                );
                if (current) return current;

                const settings = applet.settings;
                settings.ID = applet.ID;

                try {
                    // Create the settings file at the correct file path
                    const settingsFile = new SettingsFile({
                        ...settings,
                        path: Path.join(
                            this.settingsDirectory,
                            "applets",
                            applet.ID + ".json"
                        ),
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

                    return {
                        ID: applet.ID,
                        file: settingsFile,
                        appletVersion: version,
                        applet,
                    };
                } catch (e) {
                    console.error(e);
                    return [];
                }
            });
            return appletSettings;
        }
    );
}
