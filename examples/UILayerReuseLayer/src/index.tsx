import React from "react";
import {
    AbstractUILayer,
    Box,
    Content,
    ContentView,
    createSettings,
    createSettingsFolder,
    createStandardContentKeyHandler,
    createStandardMenuItem,
    createStandardMenuKeyHandler,
    declare,
    IIOContext,
    IUILayerData,
    IUILayerFieldData,
    IUILayerMenuData,
    Menu,
    MenuSearch,
    MenuView,
    UILayer,
    UnifiedAbstractUILayer,
} from "@launchmenu/core";
import {v4 as uuid} from "uuid";
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

class MyApplication extends UnifiedAbstractUILayer {
    protected data = new Field([] as IUILayerData[]);

    /**
     * Creates a new cool application thing
     */
    public constructor() {
        super({path: "My cool example"});
    }

    /** @override */
    public getAll(hook?: IDataHook): IUILayerData[] {
        return this.data.get(hook);
    }

    /** @override */
    protected initialize(context: IIOContext, close: () => void): () => void {
        // Setup menu
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

        const menu = new Menu(context, items);
        const {
            handler: menuHandler,
            destroy: destroyMenuHandler,
        } = createStandardMenuKeyHandler(menu, {onExit: close});
        const menuData = {
            ID: uuid(),
            menu,
            menuView: <MenuView menu={menu} />,
            menuHandler: menuHandler,
        };

        // Setup a search field + menu by reusing the menu search layer
        const menuSearch = new MenuSearch({
            menu,
        });

        // Setup some content
        const content = new Content(<Box>This is a great applet, very useful.</Box>);
        const contentHandler = createStandardContentKeyHandler(content, context);
        const contentData = {
            ID: uuid(),
            content,
            contentView: <ContentView content={content} />,
            contentHandler,
        };

        // Set all the data (in the appropriate order, search on top)
        this.data.set([menuData, contentData, menuSearch]);

        // Return a function that can be invoked to dispose all data
        return () => destroyMenuHandler();
    }
}

export default declare({
    info,
    settings,
    open({context, onClose}) {
        context.open(new MyApplication(), {onClose});
    },
});
