import React from "react";
import {showHighlightRect} from "../applet/components/HighlightRect";
import {TitleScreen} from "../applet/components/TitleScreen";
import {declareVideoScript} from "../applet/UI/recordVideo/declareVideoScript";

export default declareVideoScript(async ({controller, recorder, visualizer}) => {
    // await controller.setScreenOverlaysEnabled(true);
    await controller.waitForOpen();

    await controller.resetLM();
    const recordings = `${__dirname}/../../recordings`;
    const recording = await recorder.recordLM(`${recordings}/LM1.webm`);

    recording.addAudio(`${__dirname}/../../showcase audio/launchmenu sucks.wav`, {
        volume: 1,
    });
    await visualizer.show(
        <TitleScreen
            title="LaunchMenu"
            description="It sucks."
            list={["Potatoes", "Oranges", "Food"]}
        />,
        {duration: 3500, fadeIn: false}
    );

    await controller.wait(1000);
    await controller.type("Hallo");
    await controller.selectItem(/hallowed/);

    const {update, destroy} = await showHighlightRect(visualizer, {
        area: "menu",
        comment: "Fucking menu son",
    });
    await controller.wait(2000);
    update({area: "content", comment: "Darn content it is"});
    await controller.wait(2000);
    update({
        area: "menu",
        comment: "Darn fucking menu son",
    });
    await controller.wait(2000);
    update({
        area: "textField",
        comment: "How about that search?",
    });
    await controller.wait(2000);
    await destroy();

    await recording.stop();
});
