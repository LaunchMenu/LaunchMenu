import React from "React";
import {openMenuExecuteHandler} from "@launchmenu/core";
import {declare} from "@launchmenu/core/build/application/applets/declare";
import {createSettings} from "@launchmenu/core/build/settings/createSettings";
import {createSettingsFolder} from "@launchmenu/core/build/settings/inputs/createSettingsFolder";
import {createNumberSetting} from "@launchmenu/core/build/settings/inputs/createNumberSetting";
import {createStandardMenuItem} from "@launchmenu/core/build/menus/items/createStandardMenuItem";
import {searchAction} from "@launchmenu/core/build/menus/actions/types/search/searchAction";
import {IKeyEventListenerFunction} from "@launchmenu/core/build/stacks/keyHandlerStack/_types/IKeyEventListener";

export const info = {
    name: "Test",
    description: "An applet only used for testing",
    version: "0.0.0",
    icon: "search",
};

export const settings = createSettings({
    version: "0.0.0",
    settings: () =>
        createSettingsFolder({
            ...info,
            children: {
                someNumber: createNumberSetting({
                    name: "My number",
                    init: 5,
                }),
            },
        }),
});

const item2 = createStandardMenuItem({
    name: "orange",
    content: <div style={{backgroundColor: "orange"}}>hoi</div>,
    onExecute({context}) {
        const a = context.settings.get(settings).someNumber.get();
        console.log(context.settings, a);
    },
});

const item = createStandardMenuItem({
    name: "oofy",
    content: <div style={{backgroundColor: "purple"}}>No</div>,
    onExecute({context}) {
        context.settings.get(settings).someNumber.set(20);
    },
    actionBindings: [
        openMenuExecuteHandler.createBinding({items: [item2], closeOnExecute: true}),
    ],
});

export default declare({
    info,
    settings,
    globalContextMenuItems(hook) {
        return [() => ({priority: 3, item})];
    },
    async search(query) {
        return {
            children: searchAction.get([item, item2]),
        };
    },

    withSession: session => ({
        development: {
            onReload() {
                session.searchField.set("orange");
                const listener: IKeyEventListenerFunction = event => {
                    if (event.is(["ctrl", "s"])) {
                        session.LM.getSettingsManager().saveAll();
                        return true;
                    }
                    if (event.is(["ctrl", "m"])) {
                        console.log(session.LM.getSettingsManager());
                        return true;
                    }
                };
                session.context.keyHandler.push(listener);

                return () => {
                    session.context.keyHandler.remove(listener);
                };
            },
        },
    }),
});
