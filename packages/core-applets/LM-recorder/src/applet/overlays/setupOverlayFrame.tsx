import React, {FC, Fragment} from "react";
import {FillBox, IWindowFrameProps, LaunchMenu} from "@launchmenu/core";
import {IDataRetriever, useDataHook} from "model-react";

/**
 * Sets up the frame that's used to visualize the given overlay
 * @param LM The LaunchMenu instance to setup the frame for
 * @param overlays The overlays to show in the frame
 * @returns A function that can be called to dispose the frame
 */
export function setupOverlayFrame(
    LM: LaunchMenu,
    overlays: IDataRetriever<JSX.Element[]>
): () => void {
    let PrevFrame = LM.getWindowFrame();

    const Frame: FC<IWindowFrameProps> = ({children, ...rest}) => {
        const [h] = useDataHook();
        const currentOverlays = overlays(h);
        return (
            <Fragment>
                <PrevFrame {...rest}>{children}</PrevFrame>
                <FillBox font="paragraph" zIndex={1}>
                    {currentOverlays}
                </FillBox>
            </Fragment>
        );
    };
    LM.setWindowFrame(Frame);

    return () => {
        LM.setWindowFrame(PrevFrame);
    };
}
