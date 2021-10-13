import {
    createSettings,
    createSettingsFolder,
    createStandardMenuItem,
    declare,
    IApplet,
    IMenuSearchable,
    PrioritizedMenu,
    Priority,
    SearchExecuter,
    UILayer,
} from "@launchmenu/core";
import {Field, IDataHook} from "model-react";

const info = {
    name: "Example",
    description: "A minimal example applet",
    version: "0.0.0",
    icon: "applets" as const,
};

const settings = createSettings({
    version: "0.0.0",
    settings: () =>
        createSettingsFolder({
            ...info,
            children: {},
        }),
});

export default declare({
    info,
    settings,
    init: ({LM}) => session => {
        const menu = new PrioritizedMenu(session.context, []);

        // Create the searchables to be searched
        const getSearchables = (hook?: IDataHook) =>
            LM.getAppletManager()
                .getApplets(hook)
                // Only get the applets that are valid searchables
                .filter(
                    (
                        applet: IApplet | IMenuSearchable
                    ): applet is IApplet & IMenuSearchable => !!applet.search
                );
        const rootSearchable: IMenuSearchable = {
            ID: "root",
            search: async (query, hook) => ({children: getSearchables(hook)}),
        };

        // Create the search executor to perform the search
        const executer = new SearchExecuter({
            searchable: rootSearchable,
            onAdd: item => menu.addItem(item),
            onRemove: item => menu.removeItem(item),
        });

        // Search for any setting matching "open"
        executer.setQuery({search: "s:open", context: session.context});

        // Return the `open` function that can be used to open the menu in the session's context
        return {
            open({onClose}) {
                session.context.open(
                    new UILayer(() => ({menu, onClose}), {path: "Settings with open"})
                );
            },
        };
    },
});
