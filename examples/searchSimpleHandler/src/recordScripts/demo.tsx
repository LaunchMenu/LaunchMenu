import {declareVideoScript} from "@launchmenu/applet-lm-recorder";
import {baseSettings} from "@launchmenu/core";
import {reverseSearchMethod} from "..";

export default declareVideoScript(
    async ({controller, recorder, visualizer, keyVisualizer, LM}) => {
        try {
            await controller.resetLM();

            const recordings = `${__dirname}/../../recordings`;
            const recording = await recorder.recordLM(`${recordings}/demo.webm`);

            await controller.wait(1000);
            await controller.type("dlrow");
            await controller.wait(2500);
            await controller.type([{key: ["ctrl", "a"]}, {text: "s: hcraes elpmi"}]);
            await controller.wait(500);
            await controller.type([
                {key: "enter"},
                {text: "yzzuF"},
                {delay: 1000, key: "enter"},
            ]);
            await controller.wait(500);
            await controller.type([{key: ["ctrl", "a"]}, {text: "world"}]);
            await controller.wait(5000);

            await recording.stop();
        } finally {
            controller
                .getSession()
                ?.context.settings.get(baseSettings)
                .search.simpleSearchMethod.set(reverseSearchMethod);
        }
    }
);
