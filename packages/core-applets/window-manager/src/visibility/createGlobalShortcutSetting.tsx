import React from "react";
import {
    Box,
    createFieldMenuItem,
    createStandardMenuItem,
    inputExecuteHandler,
    selectExecuteHandler,
    settingPatternMatcher,
} from "@launchmenu/core";
import {Loader} from "model-react";

/**
 * Creates a setting for global shortcuts
 * @param config The configuration for the settings
 * @returns The setting
 */
export function createGlobalShortcutSetting({
    name,
    init,
    options,
    allowCustom = true,
}: {
    /** The name of the setting */
    name: string;
    /** The initial value */
    init: string;
    /** The predefined options */
    options?: string[];
    /** Whether to allow custom inputs, defaults to true */
    allowCustom?: boolean;
}) {
    return createFieldMenuItem({
        init,
        data: field => ({
            name,
            valueView: <Loader>{h => field.get(h)}</Loader>,
            resetable: true,
            resetUndoable: true,
            searchPattern: settingPatternMatcher,
            actionBindings: [
                options
                    ? selectExecuteHandler.createBinding({
                          field,
                          undoable: true,
                          options: options,
                          createOptionView: text => createStandardMenuItem({name: text}),
                          allowCustomInput: allowCustom,
                      })
                    : inputExecuteHandler.createBinding({
                          field,
                          undoable: true,
                      }),
            ],
            content: allowCustom ? (
                <Box>
                    Please see{" "}
                    <a
                        href="https://www.electronjs.org/docs/api/accelerator"
                        target="_blank">
                        Electron's documentation
                    </a>{" "}
                    for valid patterns
                </Box>
            ) : undefined,
        }),
    });
}
