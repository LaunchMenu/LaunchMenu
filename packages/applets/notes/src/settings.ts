import {
    createBooleanSetting,
    createColorSetting,
    createFileSetting,
    createNumberSetting,
    createOptionSetting,
    createSettings,
    createSettingsFolder,
    createStandardMenuItem,
    IIdentifiedSettingsConfig,
    TSettingsTree,
    TConfigSettings,
} from "@launchmenu/core";
import {notesIcon} from "./notesIcon";
import {
    highlightLanguages,
    IHighlightLanguage,
} from "./dataModel/_types/IHighlightLanguage";

export const info = {
    name: "Notes",
    description: "A notes applet",
    version: "0.0.0",
    icon: notesIcon,
} as const;

/**
 * All the settings for the notes applet
 */
export const settings = createSettings({
    version: "0.0.0",
    settings: () =>
        createSettingsFolder({
            ...info,
            children: {
                notesDir: createFileSetting({
                    name: "Notes directory",
                    init: "",
                    folder: true,
                }),
                defaults: createSettingsFolder({
                    name: "Notes defaults",
                    children: {
                        color: createColorSetting({
                            name: "Default note color",
                            description:
                                "The default note background color, `#FFF0` can be used for the normal background color",
                            init: "#FFF0",
                        }),
                        syntaxMode: createOptionSetting<IHighlightLanguage>({
                            name: "Default note syntax",
                            description: "The default syntax mode to use for note text",
                            init: "Text",
                            options: highlightLanguages,
                            createOptionView: text =>
                                createStandardMenuItem({name: text}),
                        }),
                        showRichContent: createBooleanSetting({
                            name: "Default note rich content",
                            description: `Whether to render rich content for notes with "text", "markdown" or "html" syntax modes`,
                            init: true,
                        }),
                        searchContent: createBooleanSetting({
                            name: "Default search note content",
                            description: `Whether to make the note's content searchable. This may cause some lag for big files`,
                            init: false,
                        }),
                        fontSize: createNumberSetting({
                            name: "Default note font size",
                            description:
                                "The default font size for note editor and content text",
                            init: 14,
                            min: 0,
                            max: 40,
                        }),
                    },
                }),
                editing: createSettingsFolder({
                    name: "Editor",
                    children: {
                        fullScreenEdit: createBooleanSetting({
                            name: "Full screen note edit",
                            init: true,
                        }),
                        liveUpdate: createBooleanSetting({
                            name: "Live note saving",
                            description:
                                "Whether the note should save on disk while editing, instead of once editing finished",
                            init: false,
                        }),
                    },
                }),
                inlineCategory: createBooleanSetting({
                    name: "Inline categories",
                    description:
                        "Whether to show the category as the description of notes",
                    init: false,
                }),
            },
        }),
});
export type ISettings = TConfigSettings<typeof settings>;
