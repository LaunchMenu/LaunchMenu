import React from "react";
import {
    createSettings,
    createSettingsFolder,
    createStandardMenuItem,
    declare,
    searchAction,
    UILayer,
    TextField,
    createTextFieldKeyHandler,
    EditorField,
    createFileSetting,
} from "@launchmenu/core";
import {BiNote} from "react-icons/bi";
import {notePatternMatcher} from "./notePatternMatcher";

export const notesIcon = <BiNote />;
export const info = {
    name: "Notes",
    description: "A notes applet",
    version: "0.0.0",
    icon: notesIcon,
} as const;

export const settings = createSettings({
    version: "0.0.0",
    settings: () =>
        createSettingsFolder({
            ...info,
            children: {
                notesDir: createFileSetting({
                    name: "Notes directory",
                    init: "notes",
                    folder: true,
                }),
            },
        }),
});

const items = [createStandardMenuItem({name: "hoi"})];

const field = new TextField();

export default declare({
    info,
    settings,
    async search(query, hook) {
        return {
            patternMatch: notePatternMatcher(query, hook),
            children: searchAction.get(items),
        };
    },
    open({context, onClose}) {
        // const menu = new Menu(context, items);

        // context.open(
        //     new UILayer(
        //         () => ({
        //             icon: notesIcon,
        //             menu: menu,
        //             onClose,
        //         }),
        //         {path: "Notes"}
        //     )
        // );
        console.log(context.settings.get(settings).notesDir.get());
        context.open(
            new UILayer(
                (context, close) => ({
                    icon: notesIcon,
                    field,
                    fieldHandler: createTextFieldKeyHandler(field, context, close, true),
                    fieldView: {close: true},
                    contentView: <EditorField field={field} />,
                    onClose,
                }),
                {path: "Notes"}
            )
        );
    },
});
