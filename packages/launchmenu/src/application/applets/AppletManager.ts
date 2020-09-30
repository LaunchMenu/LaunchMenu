import hmr, {HMRWatcher} from "@launchmenu/hmr";
import {Field, IDataHook} from "model-react";
import {IAppletConfig} from "./_types/IAppletConfig";
import {IAppletSource} from "./_types/IAppletSource";
import Path from "path";
import FS from "fs";
import {IApplet} from "./_types/IApplet";
import {LaunchMenu} from "../LaunchMenu";
import {IUUID} from "../../_types/IUUID";
import {ICategory} from "../../menus/actions/types/category/_types/ICategory";
import {createAppletResultCategory} from "./createAppletResultCategory";

/**
 * A manager of applets, takes care of loading applets given their locations
 */
export class AppletManager {
    protected LM: LaunchMenu;
    protected sources: IAppletSource[];
    protected reloadOnChanges: boolean;

    protected watchers = {} as {[key: string]: HMRWatcher};
    protected appletCategories = new Field([] as ICategory[]); // A menu category per applet
    protected applets = new Field([] as IApplet[]);
    protected appletDestroyers = {} as {
        [ID: string]: () => void;
        [ID: number]: () => void;
    };

    /**
     * Creates a new applet manager instances with the given sources
     * @param LM The LM instance that this applet manager is for
     * @param sources The sources that specify the applets
     * @param settingsDirectory The directory to store settings in
     * @param reloadOnChanges Whether to listen for applet code changes and update the applet when such a change occurs
     */
    public constructor(
        LM: LaunchMenu,
        sources: IAppletSource[] = [],
        reloadOnChanges: boolean = DEV
    ) {
        this.LM = LM;
        this.sources = sources;
        this.reloadOnChanges = reloadOnChanges;
        this.initApplets();
    }

    /**
     * Disposes of all data
     */
    public destroy(): void {
        Object.values(this.watchers).forEach(watcher => watcher.destroy());
        Object.values(this.appletDestroyers).forEach(destroy => destroy());
        this.appletDestroyers = {};
    }

    // Applet management
    /**
     * Adds an applet with the given source
     * @param source The source of the applet
     */
    public addApplet(source: IAppletSource): void {
        try {
            const applet = this.initApplet(source);
            this.updateApplet(applet);
            if (applet.development?.liveReload != false && DEV)
                this.setupAppletWatcher(source, applet);
        } catch (e) {
            console.error(e);
        }
    }

    /**
     * Removes an applet from the manager
     * @param ID The id of the applet to remove
     */
    public removeApplet(ID: IUUID): void {
        this.watchers[ID]?.destroy();
        delete this.watchers[ID];

        const applets = this.applets.get(null);
        this.appletDestroyers[ID]?.();
        this.applets.set(applets.filter(({ID: aid}) => aid != ID));
    }

    /**
     * Adds a new function to the disposers that should be called when an applet is unitialized
     * @param ID The ID of the applet to add the disposer to
     * @param disposer The disposer to add
     */
    public addAppletDisposer(ID: IUUID, disposer: () => void): void {
        const curDisposer =
            this.appletDestroyers[ID] ??
            (() => {
                delete this.appletDestroyers[ID];
            });
        this.appletDestroyers[ID] = () => {
            curDisposer();
            disposer();
        };
    }

    /**
     * Retrieves the loaded applets
     * @param hook The hook to subscribe to changes
     * @returns The applets
     */
    public getApplets(hook: IDataHook = null): IApplet[] {
        return this.applets.get(hook);
    }

    /**
     * Retrieves the applet and categories that items for them can be listed in
     * @param hook The hook to subscribe to changes
     * @returns The applets and categories
     */
    public getAppletCategories(
        hook: IDataHook = null
    ): {applet: IApplet; category: ICategory}[] {
        const categories = this.appletCategories.get(hook);
        return this.applets
            .get(hook)
            .map((applet, i) => ({applet, category: categories[i]}));
    }

    /**
     * Retrieves the category for the given applet
     * @param applet The applet to get the category of
     * @param hook The hook to subscribe to changes
     * @returns The category
     */
    public getAppletCategory(
        applet: IApplet,
        hook: IDataHook = null
    ): ICategory | undefined {
        const index = this.applets.get(hook).findIndex(({ID}) => ID == applet.ID);
        if (index != -1) return this.appletCategories.get(hook)[index];
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
    protected initApplet({ID, directory}: IAppletSource): IApplet {
        // Obtain the module export and check if it has a valid applet export
        const appletExport = require(directory);
        if (appletExport?.default?.info) {
            // Load the applet if valid
            const applet = appletExport.default as IAppletConfig<any>;
            return {
                ...applet,
                ID,
            };
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
        let watchDir = source.directory;
        let buildDir = Path.join(
            source.directory,
            applet.development?.watchDirectory ?? "build"
        );
        if (FS.existsSync(buildDir)) watchDir = buildDir;

        const watcher = hmr(watchDir, () => {
            try {
                this.appletDestroyers[source.ID]?.();

                const applet = this.initApplet(source);
                this.updateApplet(applet);
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
        this.watchers[source.ID] = watcher;
        return watcher;
    }

    /**
     * Updates or adds the applet
     * @param applet The applet to update
     */
    protected updateApplet(applet: IApplet): void {
        // Update the applets list
        const applets = this.applets.get(null);
        let newApplets;
        const index = applets.findIndex(({ID: OID}) => OID == applet.ID);
        if (index != -1)
            newApplets = applets.map(oApplet =>
                oApplet.ID == applet.ID ? applet : oApplet
            );
        else newApplets = [...applets, applet];
        this.applets.set(newApplets);

        // Update the categories list
        const categories = this.appletCategories.get(null);
        const newCategory = createAppletResultCategory(applet);
        let newCategories;
        if (index != -1)
            newCategories = categories.map((c, i) => (i == index ? newCategory : c));
        else newCategories = [...categories, newCategory];
        this.appletCategories.set(newCategories);

        // Handle initialization and disposing of applet
        const disposer = applet.onInit?.(this.LM);
        if (disposer) this.addAppletDisposer(applet.ID, disposer);
    }
}
