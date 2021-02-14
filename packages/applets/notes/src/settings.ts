import {
    createBooleanSetting,
    createColorSetting,
    createFileSetting,
    createNumberSetting,
    createOptionSetting,
    createSettings,
    createSettingsFolder,
    createStandardMenuItem,
} from "@launchmenu/core";
import {info} from ".";
import {
    highlightLanguages,
    IHighlightLanguage,
} from "./dataModel/_types/IHighlightLanguage";

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
            },
        }),
});
