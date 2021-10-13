import React from "react";
import {
    createSettings,
    createSettingsFolder,
    createStandardMenuItem,
    declare,
    FillBox,
    Menu,
    standardOverlayGroup,
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
    settings: () =>
        createSettingsFolder({
            ...info,
            children: {},
        }),
});

const items = [
    createStandardMenuItem({
        name: "Hello world",
        onExecute: () => alert("Hello!"),
    }),
    createStandardMenuItem({
        name: "Bye world",
        onExecute: () => alert("Bye!"),
    }),
];

export default declare({
    info,
    settings,
    async open({context, onClose}) {
        const menu = new Menu(context, items);
        // Don't use overlays
        await context.open(
            new UILayer(() => ({menu, searchable: false, onClose}), {
                path: "Layer 1",
                showNodataOverlay: false,
            })
        );

        // Use default overlays
        await context.open(
            new UILayer(
                {menu, searchable: false, destroyOnClose: false},
                {
                    path: "Layer 2",
                }
            )
        );

        // Add a field view, but use the overlay group
        await context.open(
            new UILayer(
                [
                    {
                        overlayGroup: standardOverlayGroup,
                        fieldView: <FillBox background="primary" opacity={0.5} />,
                    },
                    {menu, searchable: false, destroyOnClose: false},
                ],
                {
                    path: "Layer 3",
                    showNodataOverlay: false, // don't use default overlays
                }
            )
        );

        // Add a field overlay but add custom overlay group
        const group = Symbol("new group");
        await context.open(
            new UILayer(
                [
                    {
                        overlayGroup: group,
                        fieldView: {
                            view: <FillBox background="primary" opacity={0.5} />,
                            transparent: true,
                        },
                    },
                    {menu, searchable: false, destroyOnClose: false},
                ],
                {
                    path: "Layer 4",
                    showNodataOverlay: false, // don't use default overlays
                }
            )
        );

        // Add another field overlay but use same custom overlay group
        await context.open(
            new UILayer(
                [
                    {
                        overlayGroup: group,
                        fieldView: {
                            view: <FillBox background="secondary" opacity={0.5} />,
                            transparent: true,
                        },
                    },
                    {menu, searchable: false, destroyOnClose: false},
                ],
                {
                    path: "Layer 5",
                    showNodataOverlay: false, // don't use default overlays
                }
            )
        );
    },
});
