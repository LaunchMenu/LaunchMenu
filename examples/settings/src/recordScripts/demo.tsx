import {declareVideoScript} from "@launchmenu/applet-lm-recorder";
import {settings} from "..";

export default declareVideoScript(
    async ({controller, recorder, visualizer, keyVisualizer, LM}) => {
        try {
            await controller.resetLM();

            const recordings = `${__dirname}/../../recordings`;
            const recording = await recorder.recordLM(`${recordings}/demo.webm`);

            await controller.wait(1000);
            await controller.type("hello");

            await controller.wait(2000);
            await controller.type([
                {key: "esc"},
                {delay: 500, text: "s: name"},
                {delay: 500, key: "enter"},
                {delay: 500, key: ["ctrl", "a"]},
                {text: "John"},
                {delay: 500, key: "enter"},
                {delay: 500, key: ["ctrl", "h"]},
            ]);
            await controller.wait(1000);

            await controller.type("hello");
            await controller.wait(5000);

            await recording.stop();
        } finally {
            controller.getSession()?.context.settings.get(settings).username.set("Bob");
        }
    }
);
