import {
    baseSettings,
    createTheme,
    defaultHighlightTheme,
    defaultTheme,
    IBaseTheme,
    loadTheme,
    resetAction,
} from "@launchmenu/core";
import {declareVideoScript} from "../applet";
import {setupRecordMode} from "./utils/setupRecordMode";

export default declareVideoScript(
    async ({controller, recorder, visualizer, keyVisualizer, LM}) => {
        let restore = await setupRecordMode(LM, true);
        const session = controller.getSession();
        if (!session) return;

        try {
            await controller.resetLM();
            const recordings = `${__dirname}/../../recordings`;
            const recording = await recorder.recordLM(`${recordings}/customize.webm`);
            await controller.wait(1000);

            recording.tagTime("settings.start");
            await controller.wait(500);
            await controller.type("settings");
            await controller.wait(500);
            await controller.navigate([/settings manager/i, /base settings/i, /menu/i]);
            await controller.wait(500);
            await controller.selectItem(/margin/i);
            await controller.wait(3000);
            await controller.type([
                {key: "enter"},
                {delay: 500, key: ["ctrl", "a"]},
                {delay: 500, text: "150"},
                {delay: 500, key: "enter"},
                {delay: 1500, key: "up", repeat: 6},
                {delay: 1000, key: "down", repeat: 6},
            ]);
            await controller.wait(500);
            await controller.press("tab");
            await controller.wait(500);
            await controller.selectItem(/reset/i);
            await controller.wait(500);
            await controller.type([
                {key: "enter"},
                {delay: 1500, key: "up", repeat: 6},
                {delay: 1000, key: "down", repeat: 6},
            ]);
            await controller.wait(500);
            recording.tagTime("settings.end");

            await controller.wait(500);
            await controller.hold(["shift", "esc"]);
            await controller.wait(500);

            recording.tagTime("shortcuts.start");
            await controller.wait(500);
            await controller.type("setting: ctrl+a");
            await controller.selectItem(/select all/i);
            await controller.wait(1500);
            await controller.press("enter");
            await controller.wait(1500);
            await controller.hold(["ctrl", "j"]);
            await controller.wait(3000);
            await controller.hold(["ctrl", "j"]);
            await controller.wait(500);
            recording.tagTime("shortcuts.end");
            await controller.wait(500);
            await controller.press("backspace");

            await controller.wait(500);
            await controller.type("settings");
            await controller.wait(500);
            await controller.navigate([/settings manager/i, /dictionary/i]);

            recording.tagTime("customize.start");
            await controller.wait(1500);
            await controller.type([
                {key: "enter"},
                {delay: 1500, text: "dutch"},
                {delay: 1000, key: "enter"},
                {delay: 1500, key: "esc", repeat: 3},
            ]);
            await controller.type([{delay: 1000, text: "define: personaliseren"}], {
                delay: 50,
                variation: 50,
            });
            await controller.wait(500);
            recording.tagTime("customize.end");

            await controller.wait(4000);
            await controller.press("esc");
            await controller.wait(500);

            recording.tagTime("export.start");
            await controller.wait(1500);
            await controller.type("export");
            await controller.wait(500);
            recording.tagTime("export.end");

            await controller.wait(4000);
            await controller.press("esc");
            await controller.wait(500);

            recording.tagTime("applets.start");
            await controller.wait(1500);
            await controller.type("pickle");
            await controller.wait(500);
            recording.tagTime("applets.end");

            await controller.wait(4000);

            recording.tagTime("theme.start");
            await controller.wait(1500);
            loadTheme(pinkTheme);
            await controller.wait(3500);
            loadTheme(darkTheme);
            await controller.wait(500);
            recording.tagTime("theme.end");

            await controller.wait(5000);
            loadTheme(defaultTheme);
            await controller.press("esc");
            await controller.wait(3500);

            await recording.stop();
            await recording.saveTimestamps();
        } finally {
            await restore();

            // Restore the changed setting
            const settingsContext = LM.getSettingsManager().getSettingsContext();
            const selectAll =
                settingsContext.getUI(baseSettings).children.controls.children.field
                    .children.selectAll;
            const language = settingsContext.getUI(
                require("@launchmenu/applet-dictionary").settings
            ).children.language;
            loadTheme(defaultTheme);

            await resetAction
                .get([selectAll, language])
                .reset({context: session.context});
        }
    }
);

// Some themes to use for the theme section
const scrollbars = (theme: IBaseTheme) => ({
    "&::-webkit-scrollbar": {
        width: 15,
    },
    "&::-webkit-scrollbar-track": {
        background: theme.color.bgTertiary,
    },
    "&::-webkit-scrollbar-thumb": {
        background: theme.color.bgPrimary,
        border: "3px solid",
        borderColor: "transparent",
        backgroundClip: "padding-box",
        borderRadius: 7, // 4p + 3px border
    },
    "&::-webkit-scrollbar-thumb:hover": {
        background: theme.color.primary,
        border: "3px solid",
        borderColor: "transparent",
        backgroundClip: "padding-box",
        borderRadius: 7, // 4p + 3px border
    },
    "*:focus": {
        outline: "none",
    },
});

export const pinkTheme = createTheme(
    {
        colors: {
            accent: {
                primary: "#ff94fa",
                secondary: "#db72d6",
                tertiary: "#a1429c",
            },
            background: {
                primary: "#FFFFFF",
                secondary: "#FAFAFA",
                tertiary: "#EEEEEE",
            },
            font: {
                accent: "#000000",
                background: "#000000",
            },
        },
        globalCss: scrollbars,
    },
    defaultHighlightTheme
);

export const darkTheme = createTheme(
    {
        colors: {
            accent: {
                primary: "#7dc6ff",
                secondary: "#63bbff",
                tertiary: "#38a8ff",
            },
            background: {
                primary: "#000000",
                secondary: "#333333",
                tertiary: "#4d4d4d",
            },
            font: {
                accent: "#000000",
                background: "#FFFFFF",
            },
        },
        globalCss: scrollbars,
    },
    defaultHighlightTheme
);
