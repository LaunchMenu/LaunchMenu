import {
    createSettings,
    createSettingsFolder,
    createStandardCategory,
    createStandardMenuItem,
    declare,
    ProxiedMenu,
    Priority,
    KeyPattern,
    createKeyPatternSetting,
    createContextFolderMenuItem,
    UILayer,
    createGlobalContextBinding,
    createBooleanSetting,
    CoreAppletType,
} from "@launchmenu/core";
import {DataCacher, IDataHook} from "model-react";
import {SessionData} from "./SessionData";
import {setupSessionDisposer} from "./setupSessionDisposer";

export const info = {
    name: "Session manager",
    description: "An applet to manage all sessions within LaunchMenu",
    version: "0.0.0",
    icon: "session",
} as const;

export const settings = createSettings({
    version: "0.0.0",
    settings: () =>
        createSettingsFolder({
            ...info,
            children: {
                autoCloseEmpty: createBooleanSetting({
                    name: "Auto close empty sessions",
                    init: true,
                }),
                controls: createSettingsFolder({
                    name: "Controls",
                    children: {
                        openMenu: createKeyPatternSetting({
                            name: "Open session switcher",
                            init: new KeyPattern("ctrl+w"),
                        }),
                        newSession: createKeyPatternSetting({
                            name: "Create a new session",
                            init: new KeyPattern("ctrl+n"),
                        }),
                        toggleSession: createKeyPatternSetting({
                            name: "Toggle between sessions",
                            init: new KeyPattern("ctrl+r"),
                        }),
                    },
                }),
            },
        }),
});

export default declare({
    info,
    settings,
    coreCategory: CoreAppletType.SESSIONS,
    withLM: LM => {
        const sessionManager = LM.getSessionManager();

        const disposeSessionDisposer = setupSessionDisposer(LM);

        /** Keep track of the sessions with some extra interface data the user can attach */
        const sessionsData = new DataCacher<SessionData[]>((h, curSessionData = []) => {
            // Find the currently highest session ID (in name)
            let highestSessionID = curSessionData.reduce((cur, sessionData) => {
                const match = sessionData.name.get().match(/session-(\d+)/);
                return match ? Math.max(Number(match[1]), cur) : cur;
            }, 0);

            // Sort the new sessions to be in the same order as the old
            const newSessions = [...sessionManager.getSessions(h)];
            newSessions.sort((a, b) => {
                const indexA = curSessionData.findIndex(({session}) => session == a);
                const indexB = curSessionData.findIndex(({session}) => session == b);
                if (indexA == -1) return 1;
                if (indexB == -1) return -1;
                return indexA - indexB;
            });

            // Retrieve the updated session data
            return newSessions.map(newSession => {
                // If the session already exists, return it
                const current = curSessionData.find(({session}) => session == newSession);
                if (current) return current;

                // Create new session data for new sessions
                return new SessionData(newSession, `session-${++highestSessionID}`);
            });
        });

        // Setup the menu controls
        const sessionsControlsCategory = createStandardCategory({
            name: "Session controls",
        });
        const addSessionItem = createStandardMenuItem({
            name: "Add session",
            category: sessionsControlsCategory,
            shortcut: context => context.settings.get(settings).controls.newSession.get(),
            onExecute: () => {
                const session = sessionManager.addSession();
            },
        });
        const toggleSessionsItem = createStandardMenuItem({
            name: "Toggle sessions",
            category: sessionsControlsCategory,
            shortcut: context =>
                context.settings.get(settings).controls.toggleSession.get(),
            onExecute: () => {
                const sessions = sessionManager.getSessions();
                const prevSession = sessions[sessions.length - 2];
                if (prevSession) sessionManager.selectSession(prevSession);
            },
        });

        // Collect the items for in the menu
        const getSessionMenuItems = (h?: IDataHook) => [
            ...sessionsData.get(h).map(({sessionInterface}) => sessionInterface),
            addSessionItem,
            toggleSessionsItem,
        ];

        return {
            open({context, onClose}) {
                context.open(
                    new UILayer(() => ({
                        menu: new ProxiedMenu(context, getSessionMenuItems),
                        onClose,
                    }))
                );
            },
            globalContextMenuBindings: [
                createGlobalContextBinding({
                    priority: Priority.LOW,
                    item: createContextFolderMenuItem({
                        name: "Switch session",
                        children: getSessionMenuItems,
                        shortcut: context =>
                            context.settings.get(settings).controls.openMenu.get(),
                    }),
                }),
            ],
            onDispose: () => disposeSessionDisposer(),
        };
    },
});
