import React, {FC} from "react";
import {
    Box,
    createSettings,
    createSettingsFolder,
    createStandardMenuItem,
    createStringSetting,
    declare,
    Menu,
    searchAction,
    UILayer,
    useIOContext,
} from "@launchmenu/core";
import {useDataHook} from "model-react";

export const info = {
    name: "HelloWorld",
    description: "A minimal example applet",
    version: "0.0.0",
    icon: "applets" as const,
};

export const settings = createSettings({
    version: "0.0.0",
    settings: () =>
        createSettingsFolder({
            ...info,
            children: {
                username: createStringSetting({name: "Username", init: "Bob"}),
            },
        }),
});

const Content: FC<{text: string}> = ({text}) => {
    const context = useIOContext();
    const [hook] = useDataHook();
    const name = context?.settings.get(settings).username.get(hook);
    return (
        <Box color="primary">
            {text} {name}!
        </Box>
    );
};

const items = [
    createStandardMenuItem({
        name: "Hello world",
        content: <Content text="Hello" />,
        onExecute: ({context}) =>
            alert(`Hello ${context.settings.get(settings).username.get()}!`),
    }),
];

export default declare({
    info,
    settings,
    search: async (query, hook) => ({children: searchAction.get(items, hook)}),
    open({context, onClose}) {
        context.open(
            new UILayer(() => ({menu: new Menu(context, items), onClose}), {
                path: "Example",
            })
        );
    },
});
