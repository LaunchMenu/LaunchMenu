import {declare} from "@launchmenu/launchmenu/build/application/applets/declare";
import {createSettings} from "@launchmenu/launchmenu/build/settings/createSettings";
import {createSettingsCategory} from "@launchmenu/launchmenu/build/settings/inputs/createSettingsCategory";
import {createNumberSetting} from "@launchmenu/launchmenu/build/settings/inputs/createNumberSetting";
import {createStandardMenuItem} from "@launchmenu/launchmenu/build/menus/items/createStandardMenuItem";
import {searchAction} from "@launchmenu/launchmenu/build/menus/actions/types/search/searchAction";

export const info = {
    name: "Test",
    description: "An applet only used for testing",
    version: "0.0.0",
    icon: "search",
};

export const settings = createSettings({
    version: "0.0.0",
    settings: () =>
        createSettingsCategory({
            ...info,
            children: {
                someNumber: createNumberSetting({
                    name: "My number",
                    init: 5,
                }),
            },
        }),
});

const item = createStandardMenuItem({
    name: "purple",
    onExecute({context}) {
        context.settings.get(settings).someNumber.set(20);
    },
});
const item2 = createStandardMenuItem({
    name: "orange",
    onExecute({context}) {
        const a = context.settings.get(settings).someNumber.get();
        console.log(a);
    },
});

export default declare({
    info,
    settings,
    globalContextMenuItems(session, hook) {
        return [{priority: 3, item}];
    },
    async search(query) {
        return {
            children: searchAction.get([item, item2]),
        };
    },

    development: {
        onReload(session) {
            session.searchField.set("orange");
            session.context.keyHandler.push(event => {
                if (event.is(["ctrl", "s"])) {
                    session.LM.getAppletManager().saveAllSettings();
                }
            });
        },
    },
});
