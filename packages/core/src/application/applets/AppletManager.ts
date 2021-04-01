import hmr, {HMRWatcher} from "@launchmenu/hmr";
import {DataCacher, Field, IDataHook} from "model-react";
import {IAppletConfig} from "./_types/IAppletConfig";
import {IAppletSource} from "./_types/IAppletSource";
import Path from "path";
import FS from "fs";
import {IApplet} from "./_types/IApplet";
import {LaunchMenu} from "../LaunchMenu";
import {IUUID} from "../../_types/IUUID";
import {createAppletResultCategory} from "./createAppletResultCategory";
import {withLM} from "./declaration/withLM";
import {JSONFile} from "../../settings/storage/fileTypes/JSONFile";
import {ICategory} from "../../actions/types/category/_types/ICategory";
import {ISettingsTree} from "../../settings/_types/ISettingsTree";
import {IAppletData} from "./_types/IAppletData";

type ISettingsConfig = {
    /** The directory that settings should be stored */
    directory: string;
    /** The function to retrieve the settings for a given applet */
    getSettings: (applet: IApplet, version: IUUID) => ISettingsTree;
    /** Removes the settings of a given applet */
    removeSettings: (appletID: IUUID) => void;
};

/**
 * A manager of applets, takes care of loading applets given their locations
 */
export class AppletManager {
    protected LM: LaunchMenu;
    protected reloadOnChanges: boolean;
    protected settingsConfig: ISettingsConfig;

    protected destroyed = new Field(false);
    protected sourceFile: JSONFile;

    /** A field that can be used to dynamically add any applets to the manager (does require some manual maintenance) */
    public extraApplets = new Field([] as IAppletData[]); // TODO: make helper methods to manager the extra applets

    /** Versions numbers of the applets, such that applets are reloaded if their version changes */
    protected appletVersions = new Field({} as Record<string, number>);

    /**
     * Creates a new applet manager instances with the given sources
     * @param LM The LM instance that this applet manager is for
     * @param settingsDirectory The directory to retrieve the installed applets from
     * @param reloadOnChanges Whether to listen for applet code changes and update the applet when such a change occurs
     */
    public constructor(
        LM: LaunchMenu,
        settingsConfig: ISettingsConfig,
        reloadOnChanges: boolean = LM.isInDevMode()
    ) {
        this.LM = LM;
        this.settingsConfig = settingsConfig;
        this.reloadOnChanges = reloadOnChanges;

        this.sourceFile = new JSONFile(
            Path.join(settingsConfig.directory, "applets.json")
        );
    }

    /**
     * Properly disposes all data associated to this applet
     * @param appletData The applet data to be disposed
     */
    protected disposeAppletData(appletData: IAppletData): void {
        try {
            appletData.applet.onDispose?.();
        } catch (e) {
            console.error(e);
        }
        this.settingsConfig.removeSettings(appletData.applet.ID);
        appletData.watcher?.destroy();
    }

    /**
     * Disposes of all data
     */
    public destroy(): void {
        this.destroyed.set(true);
        // Force retrieve the applets to uninitialize old applets
        this.applets.get();
        this.extraApplets.set([]);
    }

    // Getters
    /**
     * Retrieves all the applets, including dynamic extra applets
     * @param hook The hook to subscribe to changes
     * @returns The applets data
     */
    public getAppletsData(hook?: IDataHook): IAppletData[] {
        return [...this.applets.get(hook), ...this.extraApplets.get(hook)];
    }

    /**
     * Retrieves the loaded applets
     * @param hook The hook to subscribe to changes
     * @returns The applets
     */
    public getApplets(hook?: IDataHook): IApplet[] {
        return this.getAppletsData(hook).map(({applet}) => applet);
    }

    /**
     * Retrieves the loaded applet with the given ID
     * @param ID The ID of the applet to retrieve
     * @param hook The hook to subscribe to changes
     * @returns The applet if found
     */
    public getApplet(ID: IUUID, hook?: IDataHook): IApplet | null {
        return (
            this.getAppletsData(hook).find(({applet}) => applet.ID == ID)?.applet || null
        );
    }

    /**
     * Retrieves the applet and categories that items for them can be listed in
     * @param hook The hook to subscribe to changes
     * @returns The applets and categories
     */
    public getAppletCategories(
        hook?: IDataHook
    ): {applet: IApplet; category: ICategory}[] {
        return this.getAppletsData(hook);
    }

    /**
     * Retrieves the category for the given applet
     * @param applet The applet to get the category of
     * @param hook The hook to subscribe to changes
     * @returns The category
     */
    public getAppletCategory(applet: IApplet, hook?: IDataHook): ICategory | undefined {
        return this.getAppletsData(hook).find(({applet: {ID}}) => ID == applet.ID)
            ?.category;
    }

    // Applet management
    /**
     * Initializes an applet
     * @param source The source data of the applet
     * @param version The new version of the applet
     * @throws An exception if no valid applet was found
     * @returns The applet data
     */
    protected initApplet({ID, directory}: IAppletSource, version: IUUID): IApplet {
        // Obtain the module export and check if it has a valid applet export
        const appletExport = require([".", "/"].includes(directory[0])
            ? Path.join(process.cwd(), directory)
            : directory);
        if (appletExport?.default?.info) {
            // Load the applet if valid
            const baseApplet = {
                ...(appletExport.default as IAppletConfig<any>),
                ID,
            };
            const settingsTree = this.settingsConfig.getSettings(baseApplet, version);
            return withLM(baseApplet, this.LM, settingsTree);
        } else {
            // Throw an error when the module has no proper applet
            throw Error(
                `Failed to load applet ${ID}, please make sure it has a proper default export`
            );
        }
    }

    /**
     * Retrieves a file watcher for a given applet
     * @param source The source of the applet
     * @param applet The applet to setup the watcher for
     * @returns The file watcher that was created
     */
    protected setupAppletWatcher(source: IAppletSource, applet: IApplet): HMRWatcher {
        const baseDir = source.directory;
        const absoluteBaseDir = [".", "/"].includes(baseDir[0])
            ? Path.join(process.cwd(), baseDir)
            : Path.dirname(require.resolve(`${baseDir}/package.json`));

        const buildDir = Path.join(
            absoluteBaseDir,
            applet.development?.watchDirectory ?? "build"
        );
        const watchDir = FS.existsSync(buildDir) ? buildDir : absoluteBaseDir;

        const watcher = hmr(watchDir, () => {
            try {
                // Update the version number in order to force a new instance to be initialized
                const oldVersions = this.appletVersions.get();
                this.appletVersions.set({
                    ...oldVersions,
                    [source.ID]: (oldVersions[source.ID] ?? 0) + 1,
                });

                console.log(
                    `%cApplet %c${source.ID} %chas been reloaded`,
                    "color: blue;",
                    "color: green;",
                    "color: blue;"
                );
            } catch (e) {
                console.error(e);
            }
        });

        return watcher;
    }

    /**
     * The sources in an array form
     */
    protected sources = new DataCacher(h => {
        const appletsObject = this.sourceFile.get(h);
        if (appletsObject instanceof Object && !(appletsObject instanceof Array)) {
            const appletSources = Object.keys(appletsObject).flatMap(ID => {
                const data = appletsObject[ID];
                if (typeof data == "string") return {ID, directory: data};
                else return [];
            });

            return appletSources;
        } else {
            console.error("No valid applets config was found");
            return [];
        }
    });

    /**
     * A transformer that obtains applets from the sources, versions and whether this manager is destroyed
     */
    protected applets = new DataCacher<IAppletData[]>((h, prevApplets = []) => {
        const destroyed = this.destroyed.get(h);
        const sources = destroyed ? [] : this.sources.get(h);
        const versions = this.appletVersions.get(h);
        const sourcesWithVersions = sources.map(source => ({
            ...source,
            version: versions[source.ID] ?? 0,
        }));

        // Dispose of any applets that are no longer used (or of which a new version is requested)
        prevApplets.forEach(appletData => {
            const stillUsed = !!sourcesWithVersions.find(
                source =>
                    source.ID == appletData.applet.ID &&
                    source.version == appletData.version
            );
            if (!stillUsed) this.disposeAppletData(appletData);
        });

        // Retrieve the new list of applets, using the previously initialized applet if available
        const applets = sourcesWithVersions.flatMap(source => {
            const prevApplet = prevApplets.find(
                ({applet, version}) => applet.ID == source.ID && version == source.version
            );
            if (prevApplet) return prevApplet;

            // If no applet exists for this source yet, create it
            try {
                const applet = this.initApplet(source, source.version);

                return {
                    applet,
                    category: createAppletResultCategory(applet),
                    version: source.version,
                    watcher:
                        applet.development?.liveReload != false && this.reloadOnChanges
                            ? this.setupAppletWatcher(source, applet)
                            : undefined,
                };
            } catch (e) {
                console.error(e);

                // If the latest version errored while loading, try to reinitialize the previous version
                const prev = prevApplets.find(({applet}) => applet.ID == source.ID);
                if (prev) {
                    return {
                        ...prev,
                        watcher:
                            prev.applet.development?.liveReload != false &&
                            this.reloadOnChanges
                                ? this.setupAppletWatcher(source, prev.applet)
                                : undefined,
                    };
                }

                return [];
            }
        });

        return applets;
    });
}
