import {createAppletResultCategory, IApplet, LaunchMenu, withLM} from "@launchmenu/core";

/**
 * Sets up a fake applet in LM
 * @param LM The LM instance to add the applet to
 * @param applet The applet to setup
 * @returns A function that can be used to dispose the fake applet
 */
export function setupApplet(LM: LaunchMenu, applet: IApplet): () => void {
    const settingsTree = LM.getSettingsManager().updateAppletSettings(applet, 0);
    const initializedApplet = withLM(applet, LM, settingsTree);
    const alertAppletData = {
        applet: initializedApplet,
        category: createAppletResultCategory(initializedApplet),
        version: "0",
    };

    const applets = LM.getAppletManager().extraApplets;
    applets.set([...applets.get(), alertAppletData]);

    return () =>
        applets.set(applets.get().filter(appletData => appletData != alertAppletData));
}
