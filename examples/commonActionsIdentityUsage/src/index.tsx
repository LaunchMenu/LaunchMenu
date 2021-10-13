import {
    createAction,
    createSettings,
    createSettingsFolder,
    createStandardMenuItem,
    declare,
    IMenuItem,
    IUUID,
    Menu,
    menuItemIdentityAction,
    sequentialExecuteHandler,
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
    settings: () => createSettingsFolder({...info, children: {}}),
});

const top3ExecuteHandler = createAction({
    name: "Top 3",
    parents: [sequentialExecuteHandler],
    core: (data: {priority: number; itemID: IUUID}[], indices, hook, items) => ({
        children: [
            sequentialExecuteHandler.createBinding(({context}) => {
                const ids = menuItemIdentityAction.get(items);
                const topItems = data
                    .sort(({priority: a}, {priority: b}) => a - b)
                    .slice(0, 3)
                    .map(({itemID}) => ids.get(itemID)?.())
                    .filter((item): item is IMenuItem => !!item);

                return new Promise(res => {
                    const layer = new UILayer(
                        () => ({menu: new Menu(context, topItems), onClose: res}),
                        {path: "Top 3"}
                    );
                    context.open(layer);
                });
            }),
        ],
    }),
});
const createItem = (name: string, priority: number) => {
    return createStandardMenuItem({
        name: h => name,
        identityActionBindings: itemID => [
            top3ExecuteHandler.createBinding({priority, itemID}),
        ],
    });
};
const items = [
    createItem("Item 2", 2),
    createItem("Item 4", 4),
    createItem("Item 1", 1),
    createItem("Item 5", 5),
    createItem("Item 3", 3),
];

export default declare({
    info,
    settings,
    open({context, onClose}) {
        context.open(
            new UILayer(() => ({menu: new Menu(context, items), onClose}), {
                path: "Example",
            })
        );
    },
});
