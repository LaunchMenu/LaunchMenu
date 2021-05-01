import React from "react";
import {declare, searchAction, wait} from "@launchmenu/core";
import {Field} from "model-react";
import {setupOverlayFrame} from "./overlays/setupOverlayFrame";
import {recordScript} from "./recordScript";
import {showRemoteTitleScreen, TitleScreen} from "./components/TitleScreen";
import {showHighlightRect} from "./components/HighlightRect";
import {Overlay} from "./components/Overlay";
import {AudioRecorder} from "./recordAudio/AudioRecorder";
import {createRecorderItem} from "./recordAudio/createRecorderItem";
import {info, settings} from "./settings";

const items = [createRecorderItem()];

export default declare({
    info,
    settings,
    init: ({LM}) => {
        const scriptRes = wait(500).then(() =>
            recordScript({
                LM,
                script: async controller => {
                    // await controller.setScreenOverlaysEnabled(true);
                    await controller.waitForOpen();

                    await controller.resetLM();
                    const recordings = `${__dirname}/../recordings`;
                    const recording = await controller.recorder.recordLM(
                        `${recordings}/LM1.webm`
                    );

                    recording.addAudio(
                        `${__dirname}/../showcase audio/launchmenu sucks.wav`,
                        {
                            volume: 1,
                        }
                    );
                    await controller.show(
                        <TitleScreen
                            title="LaunchMenu"
                            description="It sucks."
                            list={["Potatoes", "Oranges", "Food"]}
                        />,
                        {duration: 4000, fadeIn: false}
                    );

                    // await showRemoteTitleScreen(controller, {
                    //     props: {title: "LaunchMenu", description: "It fucking sucks."},
                    //     duration: 2000,
                    //     hideCursor: true,
                    //     fadeOut: true,
                    // });

                    // await controller.type([
                    //     "Hallo",
                    //     {delay: 1000, key: "down", repeat: 6},
                    //     {delay: 1000, key: "tab"},
                    //     {delay: 400, text: "def"},
                    //     {delay: 1000, key: "enter"},
                    //     {delay: 500, text: "day"},
                    //     {delay: 3000, key: "esc", repeat: 4, repeatDelay: 500},
                    // ]);
                    await controller.type(["Hallo"]);
                    await controller.selectItem(/hallowed/);

                    recording.addAudio(`${recordings}/sounds/notification.wav`);

                    // await wait(1001);
                    // const highlight = await showHighlightRect(controller, {
                    //     area: "textField",
                    //     visible: ["textField", "content", "menu", "path"],
                    // });
                    // await wait(1000);
                    // highlight.update("menu");
                    // await wait(1000);
                    // highlight.update("content");
                    // await wait(1000);
                    // highlight.destroy();

                    // await wait(2000);
                    await wait(1000);

                    await controller.recorder.screenshotLM(`${recordings}/ss.png`);

                    recording.addAudio(`${recordings}/sounds/notification.wav`, {
                        volume: 1.5,
                    });
                    await controller.show(<TitleScreen description="Ivan sucks" />, {
                        duration: 500,
                        fadeOut: false,
                    });

                    await recording.stop();
                },
            })
        );
        scriptRes.then(({finished}) => finished).then(() => console.log("finished"));

        return {
            search: async () => ({children: searchAction.get(items)}),
            onDispose: () => {
                // scriptRes.then(({forceQuit}) => forceQuit());
            },
        };
    },
});
