import {
    createFileSetting,
    createKeyPatternSetting,
    createSettings,
    createSettingsFolder,
    KeyPattern,
} from "@launchmenu/core";
import Path from "path";

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
            children: {
                exitWatchMode: createKeyPatternSetting({
                    name: "Exit watch mode",
                    init: new KeyPattern("ctrl+x"),
                }),
                audioDir: createFileSetting({
                    name: "Audio recording directory",
                    folder: true,
                    init: Path.join(process.cwd(), "/showcase audio"),
                }),
                recordingScriptsDir: createFileSetting({
                    name: "Script recording directory",
                    description:
                        "The directory that the recording scripts can be found in",
                    folder: true,
                    init: Path.join(process.cwd(), "/build/recording"),
                }),
            },
        }),
});
