import React, {FC} from "react";
import {Box, FillBox, IWindowFrameProps, LaunchMenu, useLM} from "@launchmenu/core";
import {IDataRetriever, useDataHook} from "model-react";
import {settings} from "./settings";

/**
 * Sets up the frame of the LaunchMenu window
 */
export function setupFrame(LM: LaunchMenu): () => void {
    getUseShadow = h =>
        LM.getSettingsManager().getSettingsContext().get(settings).windowShadow.get(h);

    let prevFrame = LM.getWindowFrame();
    LM.setWindowFrame(Frame);

    return () => {
        if (LM.getWindowFrame() == Frame) LM.setWindowFrame(prevFrame);
    };
}

let getUseShadow: IDataRetriever<boolean> | undefined;

/**
 * The frame component to use for the windows
 */
export const Frame: FC<IWindowFrameProps> = ({children}) => {
    const [h] = useDataHook();
    const shadow = getUseShadow?.(h) ?? true;
    return (
        <FillBox
            className="Application"
            font="paragraph"
            boxSizing="border-box"
            display="flex"
            css={{padding: shadow ? 18 : 0}}>
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
