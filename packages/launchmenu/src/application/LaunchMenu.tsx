import React from "react";
import Path from "path";
import {Field, getAsync, IDataHook, Loader} from "model-react";
import {LMSession} from "./LMSession/LMSession";
import {KeyHandler} from "../stacks/keyHandlerStack/KeyHandler";
import {ThemeProvider} from "../styling/theming/ThemeContext";
import {loadTheme} from "../styling/theming/loadTheme";
import {defaultTheme} from "../styling/theming/defaultTheme";
import {FillBox} from "../components/FillBox";
import {Transition} from "../components/stacks/transitions/Transition";
import {SettingsContext} from "../settings/SettingsContext";
import {ISettingsCategoryMenuItem} from "../settings/_types/ISettingsCategoryMenuItem";
import {AppletManager} from "./applets/AppletManager";
import {JSONFile} from "../settings/storage/fileTypes/JSONFile";
import {IAppletSource} from "./applets/_types/IAppletSource";
import {AppletData} from "./applets/AppletData";
import {IApplet} from "./applets/_types/IApplet";

/**
 * The main LM class
 */
export class LaunchMenu {
    public view: JSX.Element;

    protected keyHandler: KeyHandler;
    protected sessions = new Field([] as LMSession[]);

    protected settingsDirectory = Path.join(process.cwd(), "data");
    protected appletManager: AppletManager;
    protected appletSources: JSONFile;

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
        this.sessions.get(null).forEach(session => session.destroy());
    }

    /**
     * A method to initialize Launchmenu
     */
    public async setup(): Promise<void> {
        this.setupKeyHandler();
        this.setupTheme();
        await this.setupApplets();
        this.setupView();
        this.setupInitialSession();
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
            const top = this.getTopSession();
            return top?.emit(key);
        });

        // TODO: remove session switch test code
        this.addSession();
        this.keyHandler.listen(key => {
            if (key.is(["ctrl", "b"])) {
                const bottom = this.getSessions()[0];
                this.selectSession(bottom);
            }
        });
    }

    /**
     * Retrieves all of the applet sources
     * @returns The applet sources
     */
    protected async getAppletSources(): Promise<IAppletSource[]> {
        this.appletSources = new JSONFile(
            Path.join(this.settingsDirectory, "applets.json")
        );
        // console.log(await this.appletSources.load());
        const appletsObject = await getAsync(h => this.appletSources.get(h));
        if (appletsObject instanceof Object && !(appletsObject instanceof Array)) {
            const appletSources = Object.keys(appletsObject).flatMap(id => {
                const data = appletsObject[id];
                if (typeof data == "string") return {id, directory: data};
                else return [];
            });

            return appletSources;
        } else {
            throw Error("No valid applets config was found");
        }
    }

    /**
     * Initializes the available applets
     */
    protected async setupApplets(): Promise<void> {
        const appletSources = await this.getAppletSources();

        this.appletManager = new AppletManager(
            appletSources,
            Path.join(this.settingsDirectory, "applets")
        );
    }

    /**
     * Initializes the the view
     */
    protected setupView(): void {
        // TODO: add transitions
        this.view = (
            <ThemeProvider>
                <FillBox font="paragraph">
                    <Loader>
                        {h => <Transition>{this.getTopSession(h)?.view}</Transition>}
                    </Loader>
                </FillBox>
            </ThemeProvider>
        );
    }

    /**
     * Initializes the first session
     */
    protected setupInitialSession(): void {
        this.addSession();
    }

    // Applet management
    /**
     * Retrieves a settings context that contains settings for all applets
     * @param hook THe data to subscribe to changes
     * @returns The new settings context
     */
    public getSettingsContext(hook: IDataHook = null): SettingsContext {
        const data = {} as {[id: string]: ISettingsCategoryMenuItem};
        this.getApplets(hook).forEach(applet => {
            data[applet.id] = applet.settings.settings();
        });
        return new SettingsContext(data);
    }

    /**
     * Retrieves an applets that are currently loaded
     * @param hook The hook to subscribe to changes
     * @returns The available applets
     */
    public getApplets(hook: IDataHook = null): IApplet<any>[] {
        return this.appletManager?.getApplets(hook).map(({applet}) => applet) ?? [];
    }

    // Session management
    /**
     * Creates a new session
     * @returns The created and added session
     */
    public addSession(): LMSession {
        const session = new LMSession(this);
        this.sessions.set([...this.sessions.get(null), session]);
        return session;
    }

    /**
     * Removes the given session
     * @param session The session to be removed
     */
    public removeSession(session: LMSession): void {
        const newSessions = this.sessions.get(null).filter(s => s != session);
        this.sessions.set(newSessions);
    }

    /**
     * Selects the given session to be displayed
     * @param session The session to be displayed
     */
    public selectSession(session: LMSession): void {
        this.sessions.set([
            ...this.sessions.get(null).filter(s => s != session),
            session,
        ]);
    }

    /**
     * Retrieves the sessions that are currently open
     * @param hook The hook to subscribe to changes
     * @returns The sessions that are currently open
     */
    public getSessions(hook: IDataHook = null): LMSession[] {
        return this.sessions.get(hook);
    }

    /**
     * Retrieves the sessions that are currently open
     * @param hook The hook to subscribe to changes
     * @returns The current top session
     */
    public getTopSession(hook: IDataHook = null): LMSession | null {
        const sessions = this.sessions.get(hook);
        return sessions[sessions.length - 1] ?? null;
    }
}
