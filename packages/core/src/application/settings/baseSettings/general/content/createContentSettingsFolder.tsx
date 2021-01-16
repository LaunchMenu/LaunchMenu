import React from "react";
import {createStandardMenuItem} from "../../../../../menus/items/createStandardMenuItem";
import {createNumberSetting} from "../../../../../settings/inputs/createNumberSetting";
import {createSettingsFolder} from "../../../../../settings/inputs/createSettingsFolder";
import {ShortAboutLM} from "../../../../components/ShortAboutLM";
import {createHomeContentSetting} from "./createHomeContentSetting";
import {createHomeContentVisibilitySetting} from "./createHomeContentVisbilitySetting";

/**
 * Creates a new folder for general content settings
 * @returns The created content settings folder
 */
export function createContentSettingsFolder() {
    return createSettingsFolder({
        name: "Content",
        children: {
            scrollSpeed: createNumberSetting({
                name: "Content scroll speed",
                init: 30,
                content: <>The number of pixels to scroll per key press.</>,
            }),
            homeContent: createSettingsFolder({
                name: "Home content",
                children: {
                    visibility: createHomeContentVisibilitySetting(),
                    content: createHomeContentSetting([
                        {
                            ID: "LaunchMenu",
                            content: <ShortAboutLM padding="large" />,
                            view: createStandardMenuItem({name: "About LaunchMenu"}),
                        },
                    ]),
                },
            }),
        },
    });
}
