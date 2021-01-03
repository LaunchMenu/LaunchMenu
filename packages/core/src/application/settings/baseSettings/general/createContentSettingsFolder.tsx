import React from "react";
import {createNumberSetting} from "../../../../settings/inputs/createNumberSetting";
import {createSettingsFolder} from "../../../../settings/inputs/createSettingsFolder";

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
        },
    });
}
