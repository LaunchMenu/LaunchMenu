import {
    createSettings,
    createSettingsFolder,
    createStandardMenuItem,
    declare,
    executeAction,
    Menu,
    searchAction,
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

const wait = () => new Promise(res => setTimeout(res, 200));
const items = [
    createStandardMenuItem({
        name: "Parallelized executables",
        actionBindings: [
            executeAction.createBinding(async () => {
                console.log(`Parallel 1 start`);
                await wait();
                console.log(`Parallel 1 end`);
            }),
            executeAction.createBinding(async () => {
                console.log(`Parallel 2 start`);
                await wait();
                console.log(`Parallel 2 end`);
            }),
        ],
    }),
    createStandardMenuItem({
        name: "Sequential executables",
        actionBindings: [
            sequentialExecuteHandler.createBinding(async () => {
                console.log(`Sequential 1 start`);
                await wait();
                console.log(`Sequential 1 end`);
            }),
            sequentialExecuteHandler.createBinding(async () => {
                console.log(`Sequential 2 start`);
                await wait();
                console.log(`Sequential 2 end`);
            }),
        ],
    }),
];

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
            new UILayer(() => ({menu: new Menu(context, items), onClose}), {
                path: "Example",
            })
        );
    },
});
