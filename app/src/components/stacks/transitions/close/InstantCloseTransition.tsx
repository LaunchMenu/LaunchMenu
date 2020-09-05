import React, {useEffect, FC} from "react";
import {FillBox} from "../../../FillBox";
import {ICloseTransitionProps} from "./_types/ICloseTransitionProps";

/**
 * A 'transition' to instantly close the content
 */
export const InstantCloseTransition: FC<ICloseTransitionProps> = ({
    onComplete,
    children,
    activate = true,
}) => {
    // Trigger an completion directly when the animation is activated
    useEffect(() => {
        if (activate) onComplete?.();
    }, [activate]);

    // Render the last child only
    return <FillBox overflow="hidden">{children}</FillBox>;
};
