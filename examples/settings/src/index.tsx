import React, {FC} from "react";
import {
    Box,
    createSettings,
    createSettingsFolder,
    createStandardMenuItem,
    createStringSetting,
    declare,
    searchAction,
    useIOContext,
} from "@launchmenu/core";
import {useDataHook} from "model-react";

const info = {
    name: "Example",
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
                username: createStringSetting({name: "Name", init: "Bob"}),
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
        onExecute: () => alert("Hello!"),
    }),
    createStandardMenuItem({
        name: "Bye world",
        content: <Content text="Bye" />,
        onExecute: () => alert("Bye!"),
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
});
