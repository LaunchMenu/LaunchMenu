import React from "react";
import {
    Box,
    CoreAppletType,
    createSettings,
    createSettingsFolder,
    declare,
    Menu,
    searchAction,
    UILayer,
    wait,
} from "@launchmenu/core";
import {Field} from "model-react";
import {setupOverlayFrame} from "./overlays/setupOverlayFrame";
import {recordScript} from "./recordScript";
import {TitleScreen} from "./components/TitleScreen";

export const info = {
    name: "Video recorder",
    description: "An applet to script and recorded footage of LM itself",
    version: "0.0.0",
    icon: "help",
} as const;

export const settings = createSettings({
    version: "0.0.0",
    settings: () =>
        createSettingsFolder({
            ...info,
            children: {},
        }),
});

export default declare({
    info,
    settings,
    init: ({LM}) => {
        const scriptRes = wait(500).then(() =>
            recordScript({
                LM,
                script: async controller => {
                    await controller.resetLM();
                    const LMRecording = await controller.recorder.recordLM(
                        `${__dirname}/../recordings/LM1.webm`
                    );

                    await controller.show(
                        <TitleScreen title="LaunchMenu" description="Get rekt." />,
                        {showTime: 2000}
                    );

                    await wait(1000);

                    await controller.type([
                        "Hallo",
                        {delay: 1000, key: "down", repeat: 6},
                        {delay: 1000, key: "tab"},
                        {delay: 400, text: "def"},
                        {delay: 1000, key: "enter"},
                        {delay: 500, text: "day"},
                        {delay: 3000, key: "esc", repeat: 4, repeatDelay: 500},
                    ]);

                    await wait(5000);

                    await controller.show(<TitleScreen description="Ivan sucks" />, {
                        showTime: 500,
                    });

                    await LMRecording.stop();
                },
            })
        );
        scriptRes.then(({finished}) => finished).then(() => console.log("finished"));

        return {
            onDispose: () => {
                scriptRes.then(({forceQuit}) => forceQuit());
            },
        };
    },
});
