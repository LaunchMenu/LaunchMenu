import {LaunchMenu} from "@launchmenu/core";
import {DataCacher, Observer} from "model-react";
import {settings} from ".";

/**
 * Sets up a session disposer that disposes non selected session that are on the homepage
 * @param LM The LM instance
 * @returns A function to dispose
 */
export function setupSessionDisposer(LM: LaunchMenu): () => void {
    const autoClose = new DataCacher(h =>
        LM.getSettingsManager().getSettingsContext(h).get(settings).autoCloseEmpty.get(h)
    );
    const sessionManager = LM.getSessionManager();
    const homeSessions = new DataCacher(h =>
        sessionManager.getSessions(h).filter(session => session.isHome(h))
    );

    let timeoutID: null | NodeJS.Timeout = null;
    const observer = new Observer(h => {
        const ac = autoClose.get(h);
        return {
            autoClose: ac,
            homeSessions: ac && homeSessions.get(h),
            selected: sessionManager.getSelectedSession(h),
        };
    }).listen(({autoClose, homeSessions, selected}) => {
        if (autoClose && homeSessions) {
            // Wait a second before removing old sessions to allow for the transition to finish
            // TODO: find a proper way to deal with the transition, which doesn't depend on an arbitrary number
            if (timeoutID) clearTimeout(timeoutID);
            timeoutID = setTimeout(() => {
                // Remove all sessions that are empty and not selected
                homeSessions
                    .filter(session => session != selected)
                    .forEach(session => {
                        sessionManager.removeSession(session);
                        session.destroy();
                    });
            }, 1000);
        }
    });

    return () => observer.destroy();
}
