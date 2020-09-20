import {Field, IDataHook} from "model-react";
import {LaunchMenu} from "../LaunchMenu";
import {LMSession} from "./LMSession";

/**
 * A class to manage the sessions for a LM instance
 */
export class SessionManager {
    protected LM: LaunchMenu;
    protected sessions = new Field([] as LMSession[]);

    /**
     * Creates a new session manager for the given LM instance
     * @param LM The LM instance to create a manager for
     */
    public constructor(LM: LaunchMenu) {
        this.LM = LM;
    }

    /**
     * Disposes of all data in this session manager (destroying sessions)
     */
    public destroy(): void {
        this.sessions.get(null).forEach(session => session.destroy());
    }

    // Getters
    /**
     * Retrieves the sessions that are currently open
     * @param hook The hook to subscribe to changes
     * @returns The sessions that are currently open
     */
    public getSessions(hook: IDataHook = null): LMSession[] {
        return this.sessions.get(hook);
    }

    /**
     * Retrieves the session that is currently selected (the session in the last position)
     * @param hook The hook to subscribe to changes
     * @returns The current top session
     */
    public getSelectedSession(hook: IDataHook = null): LMSession | null {
        const sessions = this.sessions.get(hook);
        return sessions[sessions.length - 1] ?? null;
    }

    // Management
    /**
     * Creates a new session
     * @returns The created and added session
     */
    public addSession(): LMSession {
        const session = new LMSession(this.LM);
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
}
