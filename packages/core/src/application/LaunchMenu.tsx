import React from "react";
import Path from "path";
import {Field, IDataHook, Loader, Observer} from "model-react";
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
import {Box} from "../styling/box/Box";
import {IApplet} from "./applets/_types/IApplet";
import {ipcRenderer} from "electron";
import {LaunchMenuProvider} from "./hooks/useLM";
import {wait} from "../_tests/wait.helper";

/**
 * The main LM class
 */
export class LaunchMenu {
    protected devMode = new Field(false);

    protected dataDirectory = Path.join(process.cwd(), "data");
    protected settingsDirectory = Path.join(this.dataDirectory, "settings");

    public view: JSX.Element;

    protected keyHandler: KeyHandler;

    protected appletManager: AppletManager;
    protected sessionManager: SessionManager;
    protected settingsManager: SettingsManager;
    protected appletObserver: Observer<IApplet[]>;

    // Whether the LM window should be opened (A window manager applet will 'visualize' this state)
    protected windowVisible = new Field(false);

    /***
     * Creates a new instance of the LaunchMenu application,
     * requires setup to be called before doing anything.
     */
    public constructor() {}

    /**
     * Disposes of all runtime data
     */
    public destroy() {
        const destroyables = [
            this.keyHandler,
            this.appletManager,
            this.sessionManager,
            this.sessionManager,
            this.appletObserver,
        ];

        // Destroy all items individually, making sure that if 1 item errors, the others still get destroyed
        for (let destroyable of destroyables) {
            try {
                destroyable.destroy();
            } catch (e) {
                console.error(e);
            }
        }
    }

    // Initialization
    /**
     * A method to initialize LaunchMenu
     */
    public async setup(): Promise<void> {
        if (this.keyHandler as any) throw Error("Instance has already been set up");
        this.setupKeyHandler();
        this.setupTheme();
        this.setupSettings();
        this.setupApplets();
        this.setupView();
        this.sessionManager = new SessionManager(this);
        this.sessionManager.addSession();
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
     * Initializes the the view
     */
    protected setupView(): void {
        this.view = (
            <ThemeProvider>
                <LaunchMenuProvider value={this}>
                    <FillBox
                        className="Application"
                        font="paragraph"
                        boxSizing="border-box"
                        display="flex"
                        css={{padding: 18}}>
                        <Box
                            position="relative"
                            background="bgPrimary"
                            borderRadius="medium"
                            overflow="hidden"
                            flex="1 1 auto"
                            css={{
                                boxShadow: "0px 3px 20px -10px rgba(0,0,0,0.8)",
                            }}>
                            <Loader>
                                {h => (
                                    <Transition>
                                        {this.sessionManager.getSelectedSession(h)?.view}
                                    </Transition>
                                )}
                            </Loader>
                        </Box>
                    </FillBox>
                </LaunchMenuProvider>
            </ThemeProvider>
        );
    }

    /**
     * Initializes the applets manager
     */
    protected setupApplets(): void {
        this.appletManager = new AppletManager(this, {
            directory: this.settingsDirectory,
            getSettings: (applet, version) =>
                this.settingsManager.updateAppletSettings(applet, version),
            removeSettings: appletID =>
                this.settingsManager.destroyAppletSetting(appletID),
        });

        // Add an observer, making sure that applets always instantly reload, even if no other component requests them.
        // This is important because applets can have side effects, so even if nothing needs the applet, the applet may affect the system.
        this.appletObserver = new Observer(h =>
            this.appletManager.getApplets(h)
        ).listen(() => {});
    }

    /**
     * Initializes the settings
     */
    protected setupSettings(): void {
        this.settingsManager = new SettingsManager(
            this.settingsDirectory,
            this.dataDirectory
        );

        // Add the base settings
        baseSettings.ID = "Base";
        const settings = new SettingsFile({
            ...baseSettings,
            path: Path.join(this.settingsDirectory, "baseSettings.json"),
        });
        this.settingsManager.addSettings(baseSettings.ID, settings);
    }

    // Dev mode
    /**
     * Changes whether LaunchMenu is running in dev-mode
     * @param enabled Whether in dev-mode
     */
    public setDevMode(enabled: boolean): void {
        this.devMode.set(enabled);
    }

    /**
     * Retrieves whether LaunchMenu is running in dev-mode
     * @param hook The hook to subscribe to changes
     * @returns Whether dev mode is enabled
     */
    public isInDevMode(hook?: IDataHook): boolean {
        return this.devMode.get(hook);
    }

    // Window
    /**
     * Retrieves whether the LaunchMenu window is currently opened
     * @param hook The hook to subscribe to changes
     * @returns Whether the window should be opened
     */
    public isWindowOpen(hook?: IDataHook): boolean {
        return this.windowVisible.get(hook);
    }

    /**
     * Sets whether the window should be opened
     * @param open Whether the window should be opened
     */
    public async setWindowOpen(open: boolean): Promise<void> {
        this.windowVisible.set(open);

        // Add some delay for safety, since closing the window  usually doesn't close instantly
        // TODO: look into the possibility of making model-react listen for promises of listeners to resolve
        return wait(10);
    }

    // Utils
    /**
     * Fully restarts the LaunchMenu window
     */
    public restart(): void {
        ipcRenderer.send("restart");
    }

    /**
     * Fully shutdown LaunchMenu
     */
    public shutdown(): void {
        ipcRenderer.send("shutdown");
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
