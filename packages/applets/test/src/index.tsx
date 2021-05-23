import {Field} from "model-react";
import React from "react";
import {
    createAction,
    createSettings,
    createSettingsFolder,
    createStandardMenuItem,
    declare,
    IField,
    Loader,
    Menu,
    promptSelectExecuteHandler,
    searchAction,
    singlePromptExecuteHandler,
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

type IRotation = 0 | 90 | 180 | 270;
const setImageRotationAction = createAction({
    name: "Set image rotation",
    parents: [singlePromptExecuteHandler],
    core: (fields: IField<IRotation>[]) => ({
        children: [
            singlePromptExecuteHandler.createBinding({
                fields,
                valueRetriever: ({field}) =>
                    promptSelectExecuteHandler.createBinding({
                        field,
                        options: [0, 90, 180, 270],
                        createOptionView: option =>
                            createStandardMenuItem({name: option + " degrees"}),
                        serialize: v => v.toString(),
                        deserialize: v => Number(v),
                    }),
                commandName: "Set rotation",
            }),
        ],
    }),
});

const createImage = (name: string, field: IField<IRotation>) =>
    createStandardMenuItem({
        name: `Rotate ${name}`,
        actionBindings: [setImageRotationAction.createBinding(field)],
        content: <Loader>{h => field.get(h)}</Loader>,
    });
const items = [
    createImage("Bob", new Field(0)),
    createImage("Image 1", new Field(90)),
    createImage("Image 2", new Field(180)),
    createImage("Elma", new Field(90)),
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
