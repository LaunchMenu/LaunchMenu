import {declareVideoScript} from "@launchmenu/applet-lm-recorder";

export default declareVideoScript(
    async ({controller, recorder, visualizer, keyVisualizer, LM}) => {
        await controller.resetLM();
        keyVisualizer.setListenerEnabled(false);
        const recordings = `${__dirname}/../../recordings`;

        /* Demo */
        await controller.type("(500meter + 0.25km) in meter");
        await recorder.screenshotLM(`${recordings}/search.png`);

        /* Settings */
        // Overview
        await controller.hold(["shift", "esc"]);
        await controller.type("settings");
        await controller.navigate([/^Settings manager$/im, /Calculator/im]);
        await recorder.screenshotLM(`${recordings}/settingsOverview.png`);

        /* Error reporting */
        // No pattern
        await controller.hold(["shift", "esc"]);
        await controller.type("(45 + 3) / two");
        await recorder.screenshotLM(`${recordings}/noErrorReporting.png`);

        // Pattern
        await controller.hold(["shift", "esc"]);
        await controller.type("= (45 + 3) / two");
        await recorder.screenshotLM(`${recordings}/errorReporting.png`);
    }
);
