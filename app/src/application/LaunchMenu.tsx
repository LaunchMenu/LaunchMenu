import React from "react";
import {Field, IDataHook, Loader} from "model-react";
import {IAppletData} from "./applets/_types/IAppletData";
import {LMSession} from "./LMSession/LMSession";
import {KeyHandler} from "../stacks/keyHandlerStack/KeyHandler";
import {ThemeProvider} from "../styling/theming/ThemeContext";
import {loadTheme} from "../styling/theming/loadTheme";
import {defaultTheme} from "../styling/theming/defaultTheme";
import {FillBox} from "../components/FillBox";
import {Transition} from "../components/stacks/transitions/Transition";

/**
 * The main LM class
 */
export class LaunchMenu {
    public view: JSX.Element;

    protected keyHandler: KeyHandler;

    protected sessions = new Field([] as LMSession[]);
    protected applets = new Field([] as IAppletData[]);

    /***
     * Creates a new instance of the LaunchMenu application
     */
    public constructor() {
        this.setupKeyHandler();
        this.setupTheme();
        this.setupApplets();
        this.setupView();
        this.setupInitialSession();
    }

    /**
     * Initializes the theme
     */
    protected setupTheme(): void {
        // TODO: make theme a local io context
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
     * Initializes the available applets
     */
    protected setupApplets(): void {
        // TODO:
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
