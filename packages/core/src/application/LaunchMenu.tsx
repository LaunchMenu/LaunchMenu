import React from "react";
import Path from "path";
import {getAsync, Loader} from "model-react";
import {KeyHandler} from "../keyHandler/KeyHandler";
import {ThemeProvider} from "../styling/theming/ThemeContext";
import {loadTheme} from "../styling/theming/loadTheme";
import {defaultTheme} from "../styling/theming/defaultTheme";
import {FillBox} from "../components/FillBox";
import {Transition} from "../components/context/stacks/transitions/Transition";
import {AppletManager} from "./applets/AppletManager";
import {JSONFile} from "../settings/storage/fileTypes/JSONFile";
import {IAppletSource} from "./applets/_types/IAppletSource";
import {SettingsFile} from "../settings/storage/fileTypes/SettingsFile";
import {baseSettings} from "./settings/baseSettings/baseSettings";
import {SessionManager} from "./LMSession/SessionManager";
import {SettingsManager} from "./settings/SettingsManager";
import {Observer} from "../utils/modelReact/Observer";

/**
 * The main LM class
 */
export class LaunchMenu {
    protected settingsDirectory = Path.join(process.cwd(), "data", "settings");

    public view: JSX.Element;

    protected keyHandler: KeyHandler;
    protected appletSources: JSONFile;

    protected appletManager: AppletManager;
    protected sessionManager: SessionManager;
    protected settingsManager: SettingsManager;

    /***
     * Creates a new instance of the LaunchMenu application,
     * requires setup to be called before doing anything.
     */
    public constructor() {}

    /**
     * Disposes of all runtime data
     */
    public destroy() {
        this.keyHandler?.destroy();
        this.appletManager?.destroy();
        this.sessionManager?.destroy();
    }

    // Initialization
    /**
     * A method to initialize LaunchMenu
     */
    public async setup(): Promise<void> {
        if (this.keyHandler as any) throw Error("Instance has already been set up");
        this.setupKeyHandler();
        this.setupTheme();
        this.setupAppletsManager();
        this.setupSettings();
        this.setupView();
        this.setupSessions();
        await this.setupApplets();
    }

    /**
     * Initializes the theme
     */
    protected setupTheme(): void {
        // TODO: make theme local io context data
        loadTheme(defaultTheme);
    }

    /**
     * Initializes the key handler for the application
     */
    protected setupKeyHandler(): void {
        this.keyHandler = new KeyHandler(window).listen(key => {
            const top = this.sessionManager?.getSelectedSession();
            return top?.emit(key);
        });
    }

    /**
     * Initializes the available applets
     */
    protected setupAppletsManager(): void {
        this.appletManager = new AppletManager(this);
    }

    /**
     * Retrieves all of the applet sources
     * @returns The applet sources
     */
    protected async getAppletSources(): Promise<IAppletSource[]> {
        this.appletSources = new JSONFile(
            Path.join(this.settingsDirectory, "applets.json")
        );

        const appletsObject = await getAsync(h => this.appletSources.get(h));
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
    }

    /**
     * Initializes the available applets
     */
    protected async setupApplets(): Promise<void> {
        const appletSources = await this.getAppletSources();

        appletSources.forEach(source => {
            this.appletManager.addApplet(source);
        });
    }

    /**
     * Initializes the the view
     */
    protected setupView(): void {
        this.view = (
            <ThemeProvider>
                <FillBox font="paragraph">
                    <Loader>
                        {h => (
                            <Transition>
                                {this.sessionManager.getSelectedSession(h)?.view}
                            </Transition>
                        )}
                    </Loader>
                </FillBox>
            </ThemeProvider>
        );
    }

    /**
     * Initializes the sessions
     */
    protected setupSessions(): void {
        this.sessionManager = new SessionManager(this);
        this.sessionManager.addSession();
    }

    /**
     * Initializes the settings
     */
    protected setupSettings(): void {
        this.settingsManager = new SettingsManager();

        // Listen for any applets being added/changed and mirror changes to the settings manager
        let init = true;
        new Observer(h => this.appletManager.getApplets(h)).listen(
            (applets, _, prevApplets) => {
                const changedApplets = init
                    ? applets
                    : applets.filter(applet => !prevApplets.includes(applet));
                const removedApplets = prevApplets.filter(
                    applet => !applets.includes(applet)
                );

                // Remove any old applets
                removedApplets.forEach(({ID}) => this.settingsManager.removeSettings(ID));

                // Add any new applet data
                changedApplets.forEach(applet => {
                    const settings = applet.settings;
                    settings.ID = applet.ID;

                    const settingsFile = new SettingsFile({
                        ...settings,
                        path: Path.join(
                            this.settingsDirectory,
                            "applets",
                            applet.ID + ".json"
                        ),
                    });
                    this.settingsManager.updateSettings(applet.ID, settingsFile, applet);
                });
                init = false;
            },
            true
        );

        // Add the base settings
        baseSettings.ID = "Base";
        const settings = new SettingsFile({
            ...baseSettings,
            path: Path.join(this.settingsDirectory, "baseSettings.json"),
        });
        this.settingsManager.addSettings(baseSettings.ID, settings);
    }

    // General getters
    /**
     * Retrieves the key handler that listens for keyboard events and dispatches them
     * @returns The key handler
     */
    public getKeyHandler(): KeyHandler {
        return this.keyHandler;
    }

    /**
     * Retrieves the directory that all settings are stored in
     * @returns The settings directory path
     */
    public getSettingsDirectory(): string {
        return this.settingsDirectory;
    }

    /**
     * Retrieves the applet manager that loads all applets
     * @returns The applet manager
     */
    public getAppletManager(): AppletManager {
        return this.appletManager;
    }

    /**
     * Retrieves the session manager that manages the opened sessions
     * @returns The session manager
     */
    public getSessionManager(): SessionManager {
        return this.sessionManager;
    }

    /**
     * Retrieves the settings manager that manages all applet and global settings
     * @returns The settings manager
     */
    public getSettingsManager(): SettingsManager {
        return this.settingsManager;
    }
}
