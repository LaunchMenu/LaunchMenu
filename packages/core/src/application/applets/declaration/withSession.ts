import {LMSession} from "../../LMSession/LMSession";
import {IApplet} from "../_types/IApplet";
import {TWithSession} from "./_types/TWithSession";

/**
 * Retrieves an applet when a session is supplied
 * @param applet The applet data
 * @param session The applet data when a session is supplied
 * @returns The applet when session data is provided
 */
export function withSession<E extends IApplet>(
    applet: E,
    session: LMSession
): TWithSession<E> {
    if (applet.withSession) {
        return {
            ...applet,
            onCloseSession: undefined,
            ...applet.withSession(session),
        } as any;
    }
    return applet as any;
}
