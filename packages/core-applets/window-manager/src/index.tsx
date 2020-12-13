import React from "react";
import {
    contextMenuAction,
    createSettings,
    createSettingsFolder,
    createStandardMenuItem,
    declare,
    Observer,
    scrollableContentHandler,
    WindowManager,
} from "@launchmenu/core";
import {Field} from "model-react";
import {createWindowPositionSetting} from "./createWindowPositionSetting";
import {PositionInputContent} from "./PositionInputContent";

export const info = {
    name: "Window manager",
    description: "An window to manage LaunchMenu's window",
    version: "0.0.0",
    icon: "search", // TODO: add some appropriate icon
};

const windowManagerField = new Field(null as null | WindowManager);
export const settings = createSettings({
    version: "0.0.0",
    settings: () =>
        createSettingsFolder({
            ...info,
            children: {
                position: createWindowPositionSetting({
                    name: "Window position",
                    actionBindings: field => [
                        scrollableContentHandler.createBinding(
                            <PositionInputContent
                                windowManager={windowManagerField}
                                field={field}
                            />
                        ),
                    ],
                }),
            },
        }),
});

export default declare({
    info,
    settings,
    withLM: LM => {
        const windowManager = LM.getWindowManager();

        // Setup the position setting
        windowManagerField.set(windowManager);
        // console.log(
        //     LM.getSettingsManager().getSettingsContext().get(settings).position.get()
        // );
        // setTimeout(() => {
        //     console.log(
        //         "hoi",
        //         LM.getSettingsManager().getSettingsContext().get(settings).position.get()
        //     );
        // }, 1000);
        // new Observer(
        //     h =>
        //         LM.getSettingsManager()
        //             .getSettingsContext(h)
        //             .get(settings)
        //             .position.get(h),
        //     {debounce: -1}
        // ).listen(console.log);
        const positionSettingObserver = new Observer(h =>
            LM.getSettingsManager().getSettingsContext(h).get(settings).position.get(h)
        ).listen(position => {
            windowManager.setPosition(position);
        });

        const blurListener = () => windowManager.setVisible(false);
        // windowManager.on("blur", blurListener);

        const listener = () => windowManager.setVisible(true);
        const shortcut = "Super+Escape";
        windowManager.addGlobalShortcut(shortcut, listener);
        return {
            globalContextMenuBindings: [
                contextMenuAction.createBinding({
                    action: null,
                    preventCountCategory: true,
                    item: {
                        priority: 2,
                        item: createStandardMenuItem({
                            name: "Exit",
                            onExecute: () => windowManager.setVisible(false),
                        }),
                    },
                }),
            ],
            onDispose: () => {
                // Dispose all listeners
                positionSettingObserver.destroy();
                windowManager.removeGlobalShortcut(shortcut, listener);
                windowManager.off("blur", blurListener);
            },
        };
    },
});
