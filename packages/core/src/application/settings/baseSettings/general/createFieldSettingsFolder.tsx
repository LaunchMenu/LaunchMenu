import React from "react";
import {createBooleanSetting} from "../../../../settings/inputs/createBooleanSetting";
import {createNumberSetting} from "../../../../settings/inputs/createNumberSetting";
import {createSettingsFolder} from "../../../../settings/inputs/createSettingsFolder";

/**
 * Creates a new folder for general field settings
 * @returns The created field settings folder
 */
export function createFieldSettingsFolder() {
    return createSettingsFolder({
        name: "Field",
        children: {
            blinkSpeed: createSettingsFolder({
                name: "Cursor blink speed",
                children: {
                    onTime: createNumberSetting({
                        name: "Cursor on time",
                        init: 1000,
                        min: 0,
                        content: (
                            <>
                                The time in milliseconds that the cursor should be visible
                                each cycle.
                            </>
                        ),
                    }),
                    offTime: createNumberSetting({
                        name: "Cursor off time",
                        init: 1000,
                        min: 0,
                        content: (
                            <>
                                The time in milliseconds that the cursor should be hidden
                                each cycle.
                            </>
                        ),
                    }),
                },
            }),
            blinkDelay: createNumberSetting({
                name: "Cursor blink delay",
                init: 1000,
                min: 0,
                content: (
                    <>
                        The number of milliseconds of inactivity after which the cursor
                        should start blinking.
                    </>
                ),
            }),
            highlightingEnabled: createBooleanSetting({
                name: "Use highlighting",
                init: true,
                content: (
                    <>
                        Whether to perform syntax and error highlighting in the text
                        fields.
                    </>
                ),
            }),
        },
    });
}
