import {
    createKeyPatternSetting,
    createSettings,
    createSettingsFolder,
    createStandardMenuItem,
    createStandardMenuKeyHandler,
    declare,
    IDisposableKeyEventListener,
    IMenu,
    IMenuItemExecuteCallback,
    KeyPattern,
    Menu,
    searchAction,
    UILayer,
} from "@launchmenu/core";

const info = {
    name: "Example",
    description: "A minimal example applet",
    version: "0.0.0",
    icon: "applets" as const,
};

// Realistically this type should exist in LM, but it doesn't right now
type IMenuKeyHandlerConfig = {
    /** The code to execute when trying to exit the menu */
    onExit?: () => void;
    /** The callback to execute when a menu item was executed */
    onExecute?: IMenuItemExecuteCallback;
    /** Whether to forward events to item key handlers (can be slow for menus with many items), defaults to true*/
    useItemKeyHandlers?: boolean;
    /** Whether to forward key events to context menu items (can be costly for large selections or context menus), defaults to true */
    useContextItemKeyHandlers?: boolean;
};

const items = [
    createStandardMenuItem({
        name: "Hello world",
        onExecute: () => alert("Hello!"),
    }),
    createStandardMenuItem({
        name: "Bye world",
        onExecute: () => alert("Bye!"),
    }),
];

const settings = createSettings({
    version: "0.0.0",
    settings: () =>
        createSettingsFolder({
            ...info,
            children: {
                selectAll: createKeyPatternSetting({
                    name: "Select all",
                    init: new KeyPattern("ctrl+shift+a"),
                }),
            },
        }),
});

/**
 * Creates a menu key handler that allows for selecting all items at once
 * @param menu The menu to control
 * @param config Extra config for the handler
 * @returns The created key handler and dispose function
 */
function createKeyHandler(
    menu: IMenu,
    config?: IMenuKeyHandlerConfig
): IDisposableKeyEventListener {
    const {handler, destroy} = createStandardMenuKeyHandler(menu, config);
    const {selectAll} = menu.getContext().settings.get(settings);

    return {
        handler: key => {
            if (selectAll.get().matches(key)) {
                menu.getItems()?.forEach(item => menu.setSelected(item, true));
                return true;
            }
            return handler(key);
        },
        destroy: () => {
            return destroy();
        },
    };
}

export default declare({
    info,
    settings,
    async search(query, hook) {
        return {
            children: searchAction.get(items),
        };
    },
    open({context, onClose}) {
        context.open(
            new UILayer(
                (context, close) => {
                    const menu = new Menu(context, items);
                    // Note that this custom key handler won't be used in the search menu. To do this, you should extend the MenuSearch layer and override the `getMenuHandler` function.
                    const {handler, destroy} = createKeyHandler(menu, {onExit: close});
                    return {
                        menu: menu,
                        menuHandler: handler,
                        onClose: () => {
                            destroy();
                            onClose();
                        },
                    };
                },
                {
                    path: "Example",
                }
            )
        );
    },
});
