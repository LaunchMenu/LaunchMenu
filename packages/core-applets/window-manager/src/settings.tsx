import React from "react";
import {info} from "./";
import {
    createBooleanSetting,
    createKeyPatternSetting,
    createSettings,
    createSettingsFolder,
    KeyPattern,
    scrollableContentHandler,
} from "@launchmenu/core";
import {createCoordinateSetting} from "./createCoordinateSetting";
import {PositionInputContent} from "./position/PositionInputContent";
import {Field} from "model-react";
import {SizeInputContent} from "./size/SizeInputContent";
import {BrowserWindow, remote} from "electron";
import {createGlobalShortcutSetting} from "./visibility/createGlobalShortcutSetting";
import {createDebuggerVisibilitySetting} from "./visibility/createDebuggerVisibilitySetting";

export const minSize = {
    width: 600,
    height: 400,
};

/** The browser window to be used by the settings UI */
export const settingsBrowserWindow = new Field(null as null | BrowserWindow);

/**
 * The settings of the window manager
 */
export const settings = createSettings({
    version: "0.0.0",
    settings: () => {
        const initSize = {width: 700, height: 450};
        const screen = remote.screen.getPrimaryDisplay().bounds;

        return createSettingsFolder({
            ...info,
            children: {
                position: createCoordinateSetting({
                    name: "Window position",
                    init: {
                        x: (screen.width - initSize.width) / 2,
                        y: (screen.height - initSize.height) / 2,
                    },
                    allowNegative: true,
                    actionBindings: field => [
                        scrollableContentHandler.createBinding(
                            <PositionInputContent
                                browserWindowField={settingsBrowserWindow}
                                field={field}
                            />
                        ),
                    ],
                }),
                size: createCoordinateSetting({
                    name: "Window size",
                    init: initSize,
                    min: minSize,
                    actionBindings: field => [
                        scrollableContentHandler.createBinding(
                            <SizeInputContent
                                browserWindowField={settingsBrowserWindow}
                                field={field}
                            />
                        ),
                    ],
                }),
                visibility: createSettingsFolder({
                    name: "Visibility",
                    children: {
                        hideOnBlur: createBooleanSetting({
                            name: "Hide when losing focus",
                            init: true,
                        }),
                        showDebugger: createDebuggerVisibilitySetting(),
                    },
                }),
                controls: createSettingsFolder({
                    name: "Controls",
                    children: {
                        open: createGlobalShortcutSetting({
                            name: "Open LaunchMenu",
                            init: "Control+O",
                            options: ["Control+O", "Control+Space"],
                        }),
                        exit: createKeyPatternSetting({
                            name: "Exit LaunchMenu",
                            init: new KeyPattern("ctrl+q"),
                        }),
                        exitState: createKeyPatternSetting({
                            name: "Exit LaunchMenu keep state",
                            init: new KeyPattern("ctrl+shift+q"),
                        }),
                        restart: createKeyPatternSetting({
                            name: "Restart LaunchMenu",
                            init: new KeyPattern([]),
                        }),
                        shutdown: createKeyPatternSetting({
                            name: "Shutdown LaunchMenu",
                            init: new KeyPattern([]),
                        }),
                    },
                }),
                automaticStartup: createBooleanSetting({
                    name: "Automatic startup",
                    init: true,
                }),
            },
        });
    },
});
