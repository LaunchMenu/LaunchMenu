import React, {FC} from "react";
import {Box, FillBox, IWindowFrameProps, LaunchMenu} from "@launchmenu/core";
import {useDataHook} from "model-react";
import {settings} from "./settings";

/**
 * Sets up the frame of the LaunchMenu window
 */
export function setupFrame(LM: LaunchMenu): () => void {
    let prevFrame = LM.getWindowFrame();
    const Frame: FC<IWindowFrameProps> = ({children}) => {
        const [h] = useDataHook();
        const shadow = LM.getSettingsManager()
            .getSettingsContext()
            .get(settings)
            .windowShadow.get(h);
        return (
            <FillBox
                className="Application"
                color="fontBgPrimary"
                font="paragraph"
                boxSizing="border-box"
                display="flex"
                css={{
                    padding: shadow ? 18 : 0,
                    "*": {
                        userSelect: "none",
                    },
                }}>
                <Box
                    position="relative"
                    background="bgPrimary"
                    borderRadius="medium"
                    overflow="hidden"
                    flex="1 1 auto"
                    css={{
                        boxShadow: "0px 3px 20px -10px rgba(0,0,0,0.8)",
                    }}>
                    {children}
                </Box>
            </FillBox>
        );
    };
    LM.setWindowFrame(Frame);

    return () => {
        if (LM.getWindowFrame() == Frame) LM.setWindowFrame(prevFrame);
    };
}
