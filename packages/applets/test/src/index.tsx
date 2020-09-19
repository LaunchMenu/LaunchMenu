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

const item = createStandardMenuItem({name: "orange"});

export default declare({
    info,
    settings,
    async search(query) {
        return {
            children: searchAction.get([item]),
        };
    },
});
