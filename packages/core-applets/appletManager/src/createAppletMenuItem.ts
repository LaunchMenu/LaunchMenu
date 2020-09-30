import {
    createStandardMenuItem,
    IApplet,
    IMenuItem,
    IOContext,
    LMSession,
} from "@launchmenu/launchmenu";
import {appletManagerPatternMatcher} from "./appletManagerPatternMatcher";

/**
 * Creates a new menu item for a given applet
 * @param applet The applet to create the menu item for
 * @param session The LM session that this applet interface is for
 * @returns The created menu item
 */
export function createAppletMenuItem(applet: IApplet, session?: LMSession): IMenuItem {
    return createStandardMenuItem({
        ...applet.info,
        tags: ["applet", ...(applet.info.tags ? applet.info.tags : [])],
        searchPattern: appletManagerPatternMatcher,
        onExecute: ({context}) => {
            return new Promise((res, rej) => {
                session?.selectedApplet.set(applet);
                applet.open?.(
                    context instanceof IOContext ? context : new IOContext(context),
                    () => res()
                );
            });
        },
    });

    /**
     * TODO:
     * - Add reload action
     * - Add enable/disable switch
     * - Add category
     */
}
