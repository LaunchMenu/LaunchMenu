import React from "react";
import {
    createFieldMenuItem,
    createStandardMenuItem,
    promptSelectExecuteHandler,
    settingPatternMatcher,
} from "@launchmenu/core";
import {Loader} from "model-react";

/**
 * Creates a new debugger visibility setting
 * @returns The settings
 */
export function createDebuggerVisibilitySetting() {
    return createFieldMenuItem({
        init: "if running dev" as string,
        data: field => ({
            name: "Show debugger",
            resetUndoable: true,
            searchPattern: settingPatternMatcher,
            resetable: true,
            valueView: <Loader>{h => field.get(h)}</Loader>,
            actionBindings: [
                promptSelectExecuteHandler.createBinding({
                    field,
                    options: ["true", "false", "if running dev"],
                    createOptionView: v => createStandardMenuItem({name: v}),
                }),
            ],
        }),
    });
}
