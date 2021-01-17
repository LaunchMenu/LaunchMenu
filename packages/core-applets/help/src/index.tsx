import {
    createSettings,
    createSettingsFolder,
    declare,
    Menu,
    searchAction,
    UILayer,
} from "@launchmenu/core";
import {helpPatternMatcher} from "./helpPatternMatcher";
import {navigationItem} from "./items/navigation/navigationItem";
import {aboutItem} from "./items/aboutItem";
import {contextMenuItem} from "./items/contextMenuItem";
import {settingsItem} from "./items/settingsItem";

export const info = {
    name: "Help",
    description: "An applet to provide some help message",
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

const helpItems = [aboutItem, navigationItem, contextMenuItem, settingsItem];

export default declare({
    info,
    settings,
    async search(query, h) {
        return {
            children: searchAction.get(helpItems),
            patternMatch: helpPatternMatcher(query),
        };
    },
    open({context, onClose}) {
        context.open(new UILayer(() => ({menu: new Menu(context, helpItems), onClose})));
    },
});
