import {LaunchMenu, Observer} from "@launchmenu/core";
import {DataCacher} from "model-react";
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

    const observer = new Observer(h => {
        const ac = autoClose.get(h);
        return {
            autoClose: ac,
            homeSessions: ac && homeSessions.get(h),
            selected: sessionManager.getSelectedSession(h),
        };
    }).listen(({autoClose, homeSessions, selected}) => {
        if (autoClose && homeSessions) {
            homeSessions
                .filter(session => session != selected)
                .forEach(session => {
                    sessionManager.removeSession(session);
                    session.destroy();
                });
        }
    });

    return () => observer.destroy();
}
