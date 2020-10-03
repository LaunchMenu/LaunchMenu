import {createStandardMenuItem, IMenuItem, LMSession} from "@launchmenu/core";
import {Field} from "model-react";

/**
 * Data associated with a session
 */
export class SessionData {
    public readonly session: LMSession;
    public readonly name = new Field("");
    public readonly description = new Field(null as string | null);
    public readonly sessionInterface: IMenuItem;

    /**
     * Creates new session data
     * @param session The LM session
     * @param name The initial name of the session
     */
    public constructor(session: LMSession, name: string) {
        this.session = session;
        this.name.set(name);

        this.sessionInterface = this.initInterface();
    }

    /**
     * Creates the menu item to be used as the session's interface
     * @returns The created menu item
     */
    protected initInterface(): IMenuItem {
        return createStandardMenuItem({
            name: h => this.name.get(h || null),
            description: h => this.description.get(h || null) ?? undefined,
            onExecute: () => {
                this.session.LM.getSessionManager().selectSession(this.session);
            },
        });
    }
}
