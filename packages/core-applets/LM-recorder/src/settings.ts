import {createFileSetting, createSettings, createSettingsFolder} from "@launchmenu/core";
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
                audioDir: createFileSetting({
                    name: "Audio recording directory",
                    folder: true,
                    init: Path.join(process.cwd(), "/showcase audio"),
                }),
            },
        }),
});
