import React, {memo} from "react";
import {
    createSettings,
    createSettingsFolder,
    declare,
    Menu,
    searchAction,
    UILayer,
    Box,
    IMenuItem,
    createStandardActionBindings,
    MenuItemFrame,
    MenuItemLayout,
    simpleSearchHandler,
} from "@launchmenu/core";
import Path from "path";

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

function createImageMenuItem({
    name,
    image,
    onExecute,
}: {
    name: string;
    image: string;
    onExecute: () => void;
}): IMenuItem {
    const bindings = createStandardActionBindings(
        {
            name,
            onExecute,
        },
        () => item
    );

    const item: IMenuItem = {
        view: memo(({highlight, ...props}) => {
            return (
                <MenuItemFrame {...props}>
                    <MenuItemLayout
                        name={
                            <Box font="header">
                                <simpleSearchHandler.Highlighter query={highlight}>
                                    {name}
                                </simpleSearchHandler.Highlighter>
                            </Box>
                        }
                    />
                    <Box display="flex" justifyContent="center" padding="medium">
                        <img src={image} height={200} />
                    </Box>
                </MenuItemFrame>
            );
        }),
        actionBindings: bindings,
    };
    return item;
}

const items = [
    createImageMenuItem({
        name: "Hello world",
        image: Path.join(__dirname, "..", "images", "icon.png"),
        onExecute: () => alert("hoi"),
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
