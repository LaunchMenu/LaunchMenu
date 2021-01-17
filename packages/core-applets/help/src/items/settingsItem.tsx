import React from "react";
import {Box} from "@launchmenu/core";
import {createHelpItem} from "../createHelpItem";

export const settingsItem = createHelpItem({
    name: "Settings",
    content: (
        <Box>
            <Box marginBottom="medium">
                LaunchMenu includes default settings as well as applet settings. <br />
                These settings can be altered through the settings manager.
            </Box>
            <Box marginBottom="medium">
                In order to search for a specific setting, use the prefix:{" "}
                <Box
                    display="inline-block"
                    color="primary"
                    css={{fontFamily: "consolas"}}>
                    s:
                </Box>
                .<br />
                For example, enter{" "}
                <Box display="inline-block" css={{fontFamily: "consolas"}}>
                    <Box display="inline-block" color="primary">
                        s:
                    </Box>
                    down
                </Box>{" "}
                to search for the 'down' control.
            </Box>
            <Box marginBottom="medium">
                The settings of a specific applet can be browsed by opening the settings
                applet, by searching for the applet's name.
            </Box>
        </Box>
    ),
});
