import React from "react";
import Path from "path";
import {Loader} from "model-react";
import {KeyHandler} from "../keyHandler/KeyHandler";
import {ThemeProvider} from "../styling/theming/ThemeContext";
import {loadTheme} from "../styling/theming/loadTheme";
import {defaultTheme} from "../styling/theming/defaultTheme";
import {FillBox} from "../components/FillBox";
import {Transition} from "../components/context/stacks/transitions/Transition";
import {AppletManager} from "./applets/AppletManager";
import {SettingsFile} from "../settings/storage/fileTypes/SettingsFile";
import {baseSettings} from "./settings/baseSettings/baseSettings";
import {SessionManager} from "./LMSession/SessionManager";
import {SettingsManager} from "./settings/SettingsManager";

/**
 * The main LM class
 */
export class LaunchMenu {
    protected settingsDirectory = Path.join(process.cwd(), "data", "settings");

    public view: JSX.Element;

    protected keyHandler: KeyHandler;

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
        this.settingsManager?.destroy();
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
        this.appletManager = new AppletManager(this, this.settingsDirectory);
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
        this.settingsManager = new SettingsManager(
            h => this.appletManager.getAppletsData(h),
            this.settingsDirectory
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
