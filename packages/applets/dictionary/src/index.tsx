import {
    CoreAppletType,
    createSettings,
    createSettingsFolder,
    createStandardMenuItem,
    declare,
    Menu,
    searchAction,
    UILayer,
} from "@launchmenu/core";
import {Wiki} from "./wiki/Wiki";

export const info = {
    name: "Dictionary",
    description: "A dictionary applet",
    version: "0.0.0",
    icon: "help",
} as const;

export const settings = createSettings({
    version: "0.0.0",
    settings: () =>
        createSettingsFolder({
            ...info,
            children: {},
        }),
});

const wiki = new Wiki("https://en.wiktionary.org");

export default declare({
    info,
    settings,
    async search(query, h) {
        // const pages = await wiki.search(query.search);
        // const items = pages.map(page =>
        //     createStandardMenuItem({
        //         name: page.getTerm(),
        //         onExecute: () => console.log(page),
        //     })
        // );
        return {
            children: searchAction.get([]),
        };
    },
    open({context, onClose}) {},
});
