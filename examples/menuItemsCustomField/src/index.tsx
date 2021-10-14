import React from "react";
import {
    createSettings,
    createSettingsFolder,
    createStandardMenuItem,
    declare,
    Menu,
    searchAction,
    UILayer,
    Box,
    IInputTypeMenuItemData,
    createFieldMenuItem,
    adjustSubscribable,
    adjustBindings,
    editExecuteHandler,
} from "@launchmenu/core";
import Path from "path";
import {Loader} from "model-react";

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

function createCheckboxMenuItem({
    init,
    tags = [],
    actionBindings = [],
    ...rest
}: {init: boolean} & IInputTypeMenuItemData) {
    return createFieldMenuItem({
        init,
        data: field => ({
            valueView: (
                <Loader>
                    {h => <input type="checkbox" checked={field.get(h)} readOnly />}
                </Loader>
            ),
            tags: adjustSubscribable(tags, (tags, h) => [
                "field",
                ...tags,
                field.get(h).toString(),
            ]),
            actionBindings: adjustBindings(actionBindings, [
                editExecuteHandler.createBinding(() => {
                    field.set(!field.get());
                }),
            ]),
            ...rest,
        }),
    });
}

const goal = createCheckboxMenuItem({
    init: true,
    resetable: true,
    name: "Take over the world",
});
const openable = createCheckboxMenuItem({
    init: false,
    name: "Openable",
});
const items = [goal, openable];

export default declare({
    info,
    settings,
    async search(query, hook) {
        return {
            children: searchAction.get(items),
        };
    },
    open({context, onClose}) {
        if (!openable.get()) {
            alert("Example can't be opened without toggling openable");
            return;
        }

        context.open(
            new UILayer(() => ({menu: new Menu(context, items), onClose}), {
                path: "Example",
            })
        );
    },
});
