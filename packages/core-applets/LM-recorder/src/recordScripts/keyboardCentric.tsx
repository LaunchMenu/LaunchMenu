import {baseSettings, resetAction} from "@launchmenu/core";
import {declareVideoScript} from "../applet";
import {setupRecordMode} from "./utils/setupRecordMode";

export default declareVideoScript(
    async ({controller, recorder, visualizer, keyVisualizer, LM}) => {
        let restore = await setupRecordMode(LM);
        const session = controller.getSession();
        if (!session) return;

        try {
            await controller.resetLM();
            const recordings = `${__dirname}/../../recordings`;
            const recording = await recorder.recordLM(
                `${recordings}/keyboardCentric.webm`
            );
            await controller.wait(1000);

            await controller.type("bob");
            await controller.wait(1000);

            recording.tagTime("select.start");
            await controller.wait(500);
            await controller.type([{key: "down"}]);
            await controller.wait(500);
            recording.tagTime("select.end");

            await controller.wait(3000);

            recording.tagTime("execute.start");
            await controller.wait(500);
            await controller.type([{key: "enter"}]);
            await controller.wait(2000);
            recording.tagTime("execute.end");

            await controller.wait(500);
            await controller.type([{key: "esc"}]);
            await controller.wait(3000);

            recording.tagTime("navigateMenus.start");
            await controller.wait(500);
            await controller.type([{key: "tab"}]);
            await controller.wait(2500);
            await controller.type([{key: "esc"}]);
            await controller.wait(500);
            recording.tagTime("navigateMenus.end");

            await controller.wait(3000);

            recording.tagTime("customize.start");
            await controller.wait(500);
            await controller.type([{key: "tab"}]);
            const items = [
                /global/i,
                /settings/i,
                /all/i,
                /base/i,
                /controls/i,
                /menu/i,
                /open/i,
            ];
            for (let item of items) {
                await controller.wait(500);
                await controller.selectItem(item);
                await controller.wait(500);
                await controller.type([{key: "enter"}]);
            }
            await controller.wait(1000);
            await controller.press("contextMenu", {duration: 1000});

            await controller.wait(500);
            await controller.type([{key: "esc", repeat: 7, repeatDelay: 200}]);
            await controller.wait(1500);
            await controller.type([{key: "contextMenu"}]);
            await controller.wait(500);
            recording.tagTime("customize.end");

            await controller.wait(1500);
            await controller.type([{key: "esc", repeat: 2, repeatDelay: 1000}]);
            await controller.wait(2500);

            recording.tagTime("mnemonics.start");
            await controller.wait(500);
            await controller.type("mnemonics");
            await controller.wait(2500);
            recording.tagTime("mnemonics.end");

            await controller.wait(500);
            await controller.type([{key: "esc"}]);
            await controller.wait(2500);

            recording.tagTime("keyboardModes.start");
            await controller.wait(500);
            await controller.type("keyboard modes");
            await controller.wait(2500);
            recording.tagTime("keyboardModes.end");

            await controller.wait(2500);

            await recording.stop();
            await recording.saveTimestamps();
        } finally {
            await restore();

            // Restore the changed setting
            const openContextMenu = LM.getSettingsManager()
                .getSettingsContext()
                .getUI(baseSettings).children.controls.children.menu.children
                .openContextMenu;
            await resetAction.get([openContextMenu]).reset({context: session.context});
        }
    }
);
