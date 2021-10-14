import {
    createSettings,
    createSettingsFolder,
    createStandardMenuItem,
    declare,
    IIOContext,
    IMenu,
    IMenuCategoryConfig,
    IMenuItem,
    IQuery,
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

const settings = createSettings({
    version: "0.0.0",
    settings: () =>
        createSettingsFolder({
            ...info,
            children: {},
        }),
});

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

class HighlightMenu extends Menu {
    protected search: IQuery;

    /**
     * Creates a new menu
     * @param context The context to be used by menu items
     * @param items The initial items to store
     * @param categoryConfig The configuration for category options
     */
    constructor(
        context: IIOContext,
        items: IMenuItem[],
        categoryConfig: {search: string} & IMenuCategoryConfig
    ) {
        super(context, items, categoryConfig);
        this.search = {search: categoryConfig.search, context};
    }

    /** @override */
    public getHighlight() {
        return this.search;
    }
}

export default declare({
    info,
    settings,
    open({context, onClose}) {
        const menu = new HighlightMenu(context, items, {search: "world"});
        context.open(
            new UILayer(() => ({menu, onClose}), {
                path: "Example",
            })
        );
    },
});
