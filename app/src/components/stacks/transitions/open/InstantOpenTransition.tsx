import React, {useEffect, FC} from "react";
import {FillBox} from "../../../FillBox";
import {IOpenTransitionProps} from "./_types/IOpenTransitionProps";

/**
 * A 'transition' to instantly open the content
 */
export const InstantOpenTransition: FC<IOpenTransitionProps> = ({
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
