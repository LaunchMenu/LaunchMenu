import hmr, {HMRWatcher} from "@launchmenu/hmr";
import {Field, IDataHook} from "model-react";
import {AppletData} from "./AppletData";
import {IAppletConfig} from "./_types/IAppletConfig";
import {IAppletSource} from "./_types/IAppletSource";
import Path from "path";
import FS from "fs";
import {IApplet} from "./_types/IApplet";
import {LaunchMenu} from "../LaunchMenu";

/**
 * A manager of applets, takes care of loading applets given their locations
 */
export class AppletManager {
    protected LM: LaunchMenu;
    protected sources: IAppletSource[];
    protected settingsDirectory: string;
    protected reloadOnChanges: boolean;

    protected watchers = {} as {[key: string]: HMRWatcher};
    protected applets = new Field([] as AppletData[]);

    /**
     * Creates a new applet manager instances with the given sources
     * @param LM The LM instance that this applet manager is for
     * @param sources The sources that specify the applets
     * @param settingsDirectory The directory to store settings in
     * @param reloadOnChanges Whether to listen for applet code changes and update the applet when such a change occurs
     */
    public constructor(
        LM: LaunchMenu,
        sources: IAppletSource[],
        settingsDirectory: string,
        reloadOnChanges: boolean = DEV
    ) {
        this.LM = LM;
        this.sources = sources;
        this.settingsDirectory = settingsDirectory;
        this.reloadOnChanges = reloadOnChanges;
        this.initApplets();
    }

    /**
     * Disposes of all data
     */
    public destroy(): void {
        Object.values(this.watchers).forEach(watcher => watcher.destroy());
        this.applets
            .get(null)
            .forEach(({applet}) => applet.lifeCycle?.onDestroy?.(this.LM));
    }

    // Applet management
    /**
     * Adds an applet with the given source
     * @param source The source of the applet
     */
    public addApplet(source: IAppletSource): void {
        try {
            const appletData = this.initApplet(source);
            this.updateApplet(appletData);
            if (appletData.applet.development?.liveReload != false)
                this.setupAppletWatcher(source, appletData.applet);
        } catch (e) {
            console.error(e);
        }
    }

    /**
     * Removes an applet from the manager
     * @param id The id of the applet to remove
     */
    public removeApplet(id: string): void {
        this.watchers[id]?.destroy();
        delete this.watchers[id];

        const applets = this.applets.get(null);
        const appletData = applets.find(({applet: {ID: aid}}) => id == aid);
        if (appletData) {
            appletData.applet.lifeCycle?.onDestroy?.(this.LM);
            this.applets.set(applets.filter(({applet: {ID: aid}}) => aid != id));
        }
    }

    /**
     * Retrieves the loaded applets
     * @param hook The hook to subscribe to changes
     * @returns The applets
     */
    public getApplets(hook: IDataHook = null): IApplet[] {
        return this.getAppletData(hook).map(({applet}) => applet);
    }

    /**
     * Retrieves the initialized applet data
     * @param hook The hook to subscribe to changes
     * @returns The applet data
     */
    public getAppletData(hook: IDataHook = null): AppletData[] {
        return this.applets.get(hook);
    }

    /**
     * Initializes the applet
     */
    protected initApplets(): void {
        this.sources.forEach(source => this.addApplet(source));
    }

    /**
     * Initializes an applet
     * @param source The source data of the applet
     * @throws An exception if no valid applet was found
     * @returns The applet data
     */
    protected initApplet({id, directory}: IAppletSource): AppletData {
        // Obtain the module export and check if it has a valid applet export
        const appletExport = require(directory);
        if (appletExport?.default?.info) {
            // Load the applet if valid
            const applet = appletExport.default as IAppletConfig<any>;
            return new AppletData(applet, id, this.settingsDirectory);
        } else {
            // Throw an error when the module has no proper applet
            throw Error(
                `Failed to load applet ${id}, please make sure it has a proper default export`
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
        let watchDir = source.directory;
        let buildDir = Path.join(
            source.directory,
            applet.development?.watchDirectory ?? "build"
        );
        if (FS.existsSync(buildDir)) watchDir = buildDir;

        const watcher = hmr(watchDir, () => {
            try {
                const currentAppletData = this.applets
                    .get(null)
                    .find(({applet: {ID: id}}) => id == source.id);
                currentAppletData?.applet.lifeCycle?.onDestroy?.(this.LM);

                const applet = this.initApplet(source);
                this.updateApplet(applet);
                console.log(
                    `%cApplet %c${source.id} %chas been reloaded`,
                    "color: blue;",
                    "color: green;",
                    "color: blue;"
                );
            } catch (e) {
                console.error(e);
            }
        });
        this.watchers[source.id] = watcher;
        return watcher;
    }

    /**
     * Updates or adds the applet
     * @param appletData The new application data to store
     */
    protected updateApplet(appletData: AppletData): void {
        const applets = this.applets.get(null);
        let newApplets;
        if (applets.find(ad => ad.applet.ID == appletData.applet.ID))
            newApplets = applets.map(ad =>
                ad.applet.ID == appletData.applet.ID ? appletData : ad
            );
        else newApplets = [...applets, appletData];
        this.applets.set(newApplets);

        appletData.applet.lifeCycle?.onInit?.(this.LM);
    }

    // Settings data management
    /**
     * Saves all settings of modules that are currently loaded
     */
    public async saveAllSettings(): Promise<void> {
        await Promise.all(
            this.applets.get(null).map(({settingsFile}) => {
                return settingsFile.save();
            })
        );
    }
}
