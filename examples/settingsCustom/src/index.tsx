import React from "react";
import {
    adjustSubscribable,
    Box,
    createFieldMenuItem,
    createSettings,
    createSettingsFolder,
    createStandardMenuItem,
    declare,
    IFieldMenuItem,
    IInputTypeMenuItemData,
    promptInputExecuteHandler,
    LFC,
    Loader,
    searchAction,
    settingPatternMatcher,
    useIOContext,
} from "@launchmenu/core";
import {Field, IDataHook, useDataHook} from "model-react";

const info = {
    name: "Example",
    description: "A minimal example applet",
    version: "0.0.0",
    icon: "applets" as const,
};

type IStringMenuItemData = {
    /** The default value for the field */
    init: Date;
} & IInputTypeMenuItemData;

/**
 * Creates a new date setting
 * @param date The configuration data of the setting
 * @returns The menu item setting
 */
function createDateSetting({
    init,
    name,
    liveUpdate,
    undoable,
    actionBindings = [],
    tags = [],
    resetUndoable = undoable,
    ...rest
}: IStringMenuItemData): IFieldMenuItem<Date, string> {
    const field = new Field(init);
    const serializableField = {
        get: (h: IDataHook) => field.get(h),
        set: (value: Date) => field.set(value),
        getSerialized: (h: IDataHook) => field.get(h).toDateString(),
        setSerialized: (value: string) => field.set(new Date(value)),
    };

    return createFieldMenuItem({
        field: serializableField,
        data: field => ({
            name,
            valueView: <Loader>{h => field.get(h).toDateString()}</Loader>,
            tags: adjustSubscribable(tags, (tags, h) => [
                "field",
                ...tags,
                field.get(h).toString(),
            ]),
            resetUndoable,
            actionBindings: adjustSubscribable(actionBindings, bindings => [
                ...bindings,
                promptInputExecuteHandler.createBinding({
                    field: {
                        get: serializableField.getSerialized,
                        set: serializableField.setSerialized,
                    },
                    liveUpdate,
                    undoable,
                    checkValidity: input =>
                        isNaN(new Date(input).getMilliseconds())
                            ? {message: "Invalid date"}
                            : undefined,
                }),
            ]),

            // Setting specific properties
            icon: "settings",
            searchPattern: settingPatternMatcher,
            resetable: true,

            // Allow for overrides
            ...rest,
        }),
    });
}

export const settings = createSettings({
    version: "0.0.0",
    settings: () =>
        createSettingsFolder({
            ...info,
            children: {
                dateOfBirth: createDateSetting({
                    name: "Date of birth",
                    init: new Date(), // New born!
                }),
            },
        }),
});

const Content: LFC = () => {
    const context = useIOContext();
    const [hook] = useDataHook();
    const date = context?.settings.get(settings).dateOfBirth.get(hook);
    return <Box color="primary">Date of birth: {date?.toUTCString()}!</Box>;
};

const items = [
    createStandardMenuItem({
        name: "Hello world",
        content: <Content />,
        onExecute: () => alert("Hello!"),
    }),
    createStandardMenuItem({
        name: "Bye world",
        content: <Content />,
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
