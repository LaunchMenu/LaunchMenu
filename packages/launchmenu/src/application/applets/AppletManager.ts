import hmr, {HMRWatcher} from "@launchmenu/hmr";
import {Field, IDataHook} from "model-react";
import {AppletData} from "./AppletData";
import {IAppletConfig} from "./_types/IAppletConfig";
import {IAppletSource} from "./_types/IAppletSource";
import Path from "path";
import FS from "fs";

/**
 * A manager of applets, takes care of loading applets given their locations
 */
export class AppletManager {
    protected sources: IAppletSource[];
    protected settingsDirectory: string;
    protected reloadOnChanges: boolean;

    protected watchers = {} as {[key: string]: HMRWatcher};
    protected applets = new Field([] as AppletData[]);

    /**
     * Creates a new applet manager instances with the given sources
     * @param sources The sources that specify the applets
     * @param settingsDirectory The directory to store settings in
     * @param reloadOnChanges Whether to listen for applet code changes and update the applet when such a change occurs
     */
    public constructor(
        sources: IAppletSource[],
        settingsDirectory: string,
        reloadOnChanges: boolean = DEV
    ) {
        this.sources = sources;
        this.settingsDirectory = settingsDirectory;
        this.reloadOnChanges = reloadOnChanges;
        this.initApplets();
    }

    /**
     * Initializes the applet
     */
    protected initApplets(): void {
        this.sources.forEach(source => this.addApplet(source));
    }

    /**
     * Disposes of all data
     */
    public destroy(): void {
        Object.values(this.watchers).forEach(watcher => watcher.destroy());
    }

    /**
     * Adds an applet with the given source
     * @param source The source of the applet
     */
    protected addApplet(source: IAppletSource): void {
        try {
            const applet = this.initApplet(source);
            this.updateApplet(applet);
            this.setupAppletWatcher(source);
        } catch (e) {
            console.error(e);
        }
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
     * @returns The file watcher that was created
     */
    protected setupAppletWatcher(source: IAppletSource): HMRWatcher {
        let watchDir = source.directory;
        let buildDir = Path.join(source.directory, "build"); // TODO: make this directory configurable
        if (FS.existsSync(buildDir)) watchDir = buildDir;

        const watcher = hmr(watchDir, (changed, affected) => {
            try {
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
        if (applets.find(ad => ad.applet.id == appletData.applet.id))
            newApplets = applets.map(ad =>
                ad.applet.id == appletData.applet.id ? appletData : ad
            );
        else newApplets = [...applets, appletData];
        this.applets.set(newApplets);
    }

    /**
     * Retrieves the initialized applets
     * @param hook The hook to subscribe to changes
     * @returns The applets
     */
    public getApplets(hook: IDataHook = null): AppletData[] {
        return this.applets.get(hook);
    }
}
